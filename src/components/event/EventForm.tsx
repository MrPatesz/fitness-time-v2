import {Button, Group, NumberInput, Stack, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useTranslation} from "next-i18next";
import {FunctionComponent} from "react";
import {BasicEventType, CreateEventType} from "../../models/event/Event";
import {LocationPicker} from "../location/LocationPicker";
import {RichTextField} from "../rich-text/RichTextField";
import {IntervalPicker} from "./IntervalPicker";
import {CreateLocationType, LocationType} from "../../models/Location";

export const EventForm: FunctionComponent<{
  originalEvent: CreateEventType | BasicEventType;
  onSubmit: (event: CreateEventType | BasicEventType) => void;
}> = ({originalEvent, onSubmit}) => {
  const form = useForm<CreateEventType | BasicEventType>({
    initialValues: originalEvent,
    validateInputOnChange: true,
    validate: {
      name: (value) => value ? null : t("eventForm.name.error"),
      location: (value: CreateLocationType | LocationType) => Boolean(value?.address) ? null : t("eventForm.location.error"),
      start: (value) => value > new Date() ? null : t("eventForm.start.error"),
      end: (value, formData) => (value > new Date() && value > formData.start) ? null : t("eventForm.end.error"),
    },
  });
  const {t} = useTranslation("common");

  return (
    <form onSubmit={form.onSubmit((data) => onSubmit(data))}>
      <Stack>
        <TextInput
          withAsterisk
          data-autofocus
          label={t("common.name")}
          placeholder={t("eventForm.name.placeholder")}
          {...form.getInputProps("name")}
        />
        <IntervalPicker
          start={form.getInputProps("start").value}
          end={form.getInputProps("end").value}
          onChange={(newStart, newEnd) => {
            form.getInputProps("start").onChange(newStart);
            form.getInputProps("end").onChange(newEnd);
          }}
          startError={form.getInputProps("start").error}
          endError={form.getInputProps("end").error}
        />
        <LocationPicker
          location={form.getInputProps("location").value}
          required={true}
          placeholder={t("eventForm.location.placeholder")}
          initialAddress={form.getInputProps("location").value?.address ?? ""}
          setLocation={form.getInputProps("location").onChange}
          error={form.getInputProps("location").error}
        />
        <RichTextField
          label={t("eventForm.description.label")}
          placeholder={t("eventForm.description.placeholder")}
          formInputProps={form.getInputProps("description")}
        />
        <NumberInput
          label={t("eventForm.price.label")}
          placeholder={t("eventForm.price.placeholder")}
          {...form.getInputProps("price")}
          min={1}
          parser={(value: string | undefined) =>
            value?.replace(/\$\s?|(,*)/g, "")
          }
          formatter={(value: string | undefined) =>
            !Number.isNaN(parseFloat(`${value}`))
              ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : "$ "
          }
        />
        <NumberInput
          label={t("eventForm.limit.label")}
          placeholder={t("eventForm.limit.placeholder")}
          {...form.getInputProps("limit")}
          min={1}
        />
        <Group position="right">
          <Button
            variant="default"
            onClick={() => form.reset()}
            disabled={!form.isDirty()}
          >
            {t("button.reset")}
          </Button>
          <Button type="submit" disabled={!form.isValid() || !form.isDirty()}>
            {t("button.submit")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
