import {Button, Group, NumberInput, Stack, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {closeAllModals} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {useTranslation} from "next-i18next";
import {FunctionComponent} from "react";
import {CreateEventType} from "../../models/Event";
import {api} from "../../utils/api";
import {getDefaultCreateEvent} from "../../utils/defaultObjects";
import {LocationPicker} from "../location/LocationPicker";
import {RichTextField} from "../rich-text/RichTextField";
import {IntervalPicker} from "./IntervalPicker";

export const EventForm: FunctionComponent<{
  editedEventId?: number;
  initialInterval?: {
    start: Date;
    end: Date;
  };
}> = ({editedEventId, initialInterval}) => {
  const {t} = useTranslation("common");

  const getErrors = (data: CreateEventType, isCreation: boolean) => ({
    name: (isCreation || data.name) ? null : t("eventForm.name.error"),
    location: (isCreation || !!data.location?.address) ? null : t("eventForm.location.error"),
    start: data.start > new Date() ? null : t("eventForm.start.error"),
    end: (data.end > new Date() && data.end > data.start) ? null : t("eventForm.end.error"),
  });

  const resetForm = (data: CreateEventType) => {
    form.setValues(data);
    form.setErrors(getErrors(data, !editedEventId));
  };

  const queryContext = api.useContext();
  const editedEventQuery = api.event.getById.useQuery(editedEventId ?? 0, {
    enabled: !!editedEventId,
    initialData: getDefaultCreateEvent(initialInterval),
    onSuccess: resetForm,
  });

  const form = useForm<CreateEventType>({
    initialValues: editedEventQuery.data,
    initialErrors: getErrors(editedEventQuery.data, !editedEventId),
    validateInputOnChange: true,
    validate: {
      name: (value) => value ? null : t("eventForm.name.error"),
      location: (value) => !!value?.address ? null : t("eventForm.location.error"),
      start: (value) => value > new Date() ? null : t("eventForm.start.error"),
      end: (value, formData) => (value > new Date() && value > formData.start) ? null : t("eventForm.end.error"),
    },
  });

  const useUpdate = api.event.update.useMutation({
    onSuccess: () => queryContext.event.invalidate().then(() => {
      closeAllModals();
      showNotification({
        color: "green",
        title: t("notification.event.update.title"),
        message: t("notification.event.update.message"),
      });
    }),
  });
  const useCreate = api.event.create.useMutation({
    onSuccess: () => queryContext.event.invalidate().then(() => {
      closeAllModals();
      showNotification({
        color: "green",
        title: t("notification.event.create.title"),
        message: t("notification.event.create.message"),
      });
    }),
  });

  const isFormDirty = () => JSON.stringify(form.values) !== JSON.stringify(editedEventQuery.data);

  return (
    <form
      onSubmit={form.onSubmit((data) => {
        const changedEvent = {...data, price: data.price ?? null, limit: data.limit ?? null};
        editedEventId ? useUpdate.mutate({id: editedEventId, event: changedEvent}) : useCreate.mutate(changedEvent);
      })}
    >
      <Stack>
        <TextInput
          withAsterisk
          data-autofocus
          label={t("common.name")}
          placeholder={t("eventForm.name.placeholder") as string}
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
          label={t("eventForm.description.label") as string}
          placeholder={t("eventForm.description.placeholder") as string}
          formInputProps={form.getInputProps("description")}
        />
        <NumberInput
          label={t("eventForm.price.label")}
          placeholder={t("eventForm.price.placeholder") as string}
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
          placeholder={t("eventForm.limit.placeholder") as string}
          {...form.getInputProps("limit")}
          min={1}
        />
        <Group position="right">
          <Button
            variant="default"
            onClick={() => resetForm(editedEventQuery.data)}
            disabled={!isFormDirty()}
          >
            {t("button.reset")}
          </Button>
          <Button type="submit" disabled={!form.isValid() || !isFormDirty()}>
            {t("button.submit")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
