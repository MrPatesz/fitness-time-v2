import {Button, Group, NumberInput, Stack, Textarea, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {closeAllModals} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {FunctionComponent} from "react";
import {CreateEventType} from "../../models/Event";
import {api} from "../../utils/api";
import {getDefaultCreateEvent} from "../../utils/defaultObjects";
import {LocationPicker} from "../location/LocationPicker";
import {IntervalPicker} from "./IntervalPicker";

const getErrors = (data: CreateEventType, isCreation: boolean) => ({
  name: (isCreation || data.name) ? null : "Name is required",
  location: (isCreation || !!data.location?.address) ? null : "Location is required",
  start: data.start > new Date() ? null : "Invalid start",
  end: (data.end > new Date() && data.end > data.start) ? null : "Invalid end",
});

export const EventForm: FunctionComponent<{
  editedEventId?: number;
  initialInterval?: {
    start: Date;
    end: Date;
  };
}> = ({editedEventId, initialInterval}) => {
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
      name: (value) => value ? null : "Name is required",
      location: (value) => !!value?.address ? null : "Location is required",
      start: (value) => value > new Date() ? null : "Invalid start",
      end: (value, formData) =>
        (value > new Date() && value > formData.start) ? null : "Invalid end",
    },
  });

  const useUpdate = api.event.update.useMutation({
    onSuccess: () => queryContext.event.invalidate().then(() => {
      closeAllModals();
      showNotification({
        color: "green",
        title: "Updated event!",
        message: "The event has been modified.",
      });
    }),
  });
  const useCreate = api.event.create.useMutation({
    onSuccess: () => queryContext.event.invalidate().then(() => {
      closeAllModals();
      showNotification({
        color: "green",
        title: "Created event!",
        message: "A new event has been created.",
      });
    }),
  });

  const isFormDirty = () => JSON.stringify(form.values) !== JSON.stringify(editedEventQuery.data);

  return (
    <form
      onSubmit={form.onSubmit((data) =>
        editedEventId ? useUpdate.mutate({id: editedEventId, event: data}) : useCreate.mutate(data)
      )}
    >
      <Stack>
        <TextInput
          withAsterisk
          data-autofocus
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
          initialAddress={form.getInputProps("location").value?.address ?? ""}
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
        <Group position="right">
          <Button
            variant="default"
            onClick={() => resetForm(editedEventQuery.data)}
            disabled={!isFormDirty()}
          >
            Reset
          </Button>
          <Button type="submit" disabled={!form.isValid() || !isFormDirty()}>
            Submit
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
