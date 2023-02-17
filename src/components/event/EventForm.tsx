import {Button, NumberInput, Stack, Textarea, TextInput} from "@mantine/core";
import {FunctionComponent} from "react";
import {BasicEventType, CreateEventType} from "../../models/Event";
import {IntervalPicker} from "../IntervalPicker";
import {useForm} from "@mantine/form";

const getDefaultCreateEvent = (): CreateEventType => ({
  name: "",
  start: new Date(new Date().setHours(new Date().getHours() + 1)),
  end: new Date(new Date().setHours(new Date().getHours() + 2)),
  description: "",
  equipment: "",
  limit: null,
  price: null,
});

export const EventForm: FunctionComponent<{
  originalEvent?: CreateEventType | BasicEventType | undefined;
  onSubmit: (data: CreateEventType) => void;
}> = ({originalEvent, onSubmit}) => {
  const now = new Date();

  const form = useForm<CreateEventType>({
    initialValues: originalEvent ?? getDefaultCreateEvent(),
    initialDirty: {name: !originalEvent},
    clearInputErrorOnChange: false,
    validateInputOnChange: true,

    validate: {
      name: (value) => value ? null : 'Name is required',
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
          {...form.getInputProps('name')}
        />
        <IntervalPicker
          start={form.getInputProps('start').value}
          end={form.getInputProps('end').value}
          onChange={(newStart, newEnd) => {
            form.getInputProps('start').onChange(newStart);
            form.getInputProps('end').onChange(newEnd);
          }}
          startError={form.getInputProps('start').error}
          endError={form.getInputProps('end').error}
        />
        {/*<LocationPicker
        defaultLocation={event.location.address}
        setLocation={(newLocation) =>
          setEvent({
            ...event,
            location: newLocation,
          })
        }
      />*/}
        <Textarea
          label="Description"
          placeholder="What are the plans?"
          {...form.getInputProps('description')}
        />
        <TextInput
          label="Equipment"
          placeholder="Is any equipment needed?"
          {...form.getInputProps('equipment')}
        />
        <NumberInput
          label="Price"
          placeholder="Do participants need to pay for it?"
          {...form.getInputProps('price')}
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
          {...form.getInputProps('limit')}
          min={1}
        />
        {/* <Checkbox
        label="Is it recurring every week?"
        checked={event.recurring}
        onChange={(e) =>
          setEvent({ ...event, recurring: e.currentTarget.checked })
        }
      /> */}
        <Button type="submit" disabled={!form.isDirty() || !form.isValid()}>
          Submit
        </Button>
      </Stack>
    </form>
  );
};
