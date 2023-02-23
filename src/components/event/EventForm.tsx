import {Button, Group, NumberInput, Stack, Textarea, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {FunctionComponent} from "react";
import {CreateEventType} from "../../models/Event";
import {getDefaultCreateEvent} from "../../utils/defaultObjects";
import {IntervalPicker} from "./IntervalPicker";
import {LocationPicker} from "../location/LocationPicker";

export const EventForm: FunctionComponent<{
  originalEvent: CreateEventType | undefined;
  onSubmit: (data: CreateEventType) => void;
}> = ({originalEvent, onSubmit}) => {
  const now = new Date();
  const initialValues = originalEvent ?? getDefaultCreateEvent();

  const form = useForm<CreateEventType>({
    initialValues,
    initialErrors: {
      start: initialValues.start.getTime() > now.getTime() ? null : "Invalid start",
      end: (initialValues.end.getTime() > now.getTime() && initialValues.end.getTime() > initialValues.start.getTime()) ? null : "Invalid end",
    },
    validateInputOnChange: true,
    validate: {
      name: (value) => value ? null : "Name is required",
      location: (value) => !!value.address ? null : "Location is required",
      start: (value) => value.getTime() > now.getTime() ? null : "Invalid start",
      end: (value, formData) =>
        (value.getTime() > now.getTime() && value.getTime() > formData.start.getTime()) ? null : "Invalid end",
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <TextInput
          withAsterisk
          label="Name"
          placeholder="What is the event called?"
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
          placeholder="Where will it take place?"
          initialAddress={form.getInputProps("location").value.address}
          setLocation={form.getInputProps("location").onChange}
          error={form.getInputProps("location").error}
        />
        <Textarea
          label="Description"
          placeholder="What are the plans?"
          {...form.getInputProps("description")}
        />
        <TextInput
          label="Equipment"
          placeholder="Is any equipment needed?"
          {...form.getInputProps("equipment")}
        />
        <NumberInput
          label="Price"
          placeholder="Do participants need to pay for it?"
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
          label="Limit"
          placeholder="Is there a maximum number of participants?"
          {...form.getInputProps("limit")}
          min={1}
        />
        {/* <Checkbox
        label="Is it recurring every week?"
        checked={event.recurring}
        onChange={(e) =>
          setEvent({ ...event, recurring: e.currentTarget.checked })
        }
      /> */}
        <Group position="apart">
          <Button onClick={form.reset} color="gray" disabled={!form.isDirty()}>
            Reset
          </Button>
          <Button type="submit" disabled={!form.isValid() || !form.isDirty()}>
            Submit
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
