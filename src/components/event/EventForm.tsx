import {Button, Group, NumberInput, Stack, Textarea, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {closeAllModals} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {now} from "next-auth/client/_utils";
import {FunctionComponent, useMemo} from "react";
import {CreateEventType} from "../../models/Event";
import {api} from "../../utils/api";
import {getDefaultCreateEvent} from "../../utils/defaultObjects";
import {LocationPicker} from "../location/LocationPicker";
import {IntervalPicker} from "./IntervalPicker";

const getErrors = (data: CreateEventType) => ({
  start: data.start.getTime() > (1000 * now()) ? null : "Invalid start",
  end: (data.end.getTime() > (1000 * now()) && data.end.getTime() > data.start.getTime()) ? null : "Invalid end",
});

export const EventForm: FunctionComponent<{
  editedEventId?: number;
  initialInterval?: {
    start: Date;
    end: Date;
  };
}> = ({editedEventId, initialInterval}) => {
  const queryContext = api.useContext();
  const editedEventQuery = api.event.getById.useQuery(editedEventId ?? 0, {
    enabled: !!editedEventId,
    initialData: getDefaultCreateEvent(),
    onSuccess: (data) => {
      form.setValues(data);
      form.setErrors(getErrors(data));
    },
  });

  const formData = useMemo(() => {
    return initialInterval ? {...getDefaultCreateEvent(), ...initialInterval} : editedEventQuery.data;
  }, [initialInterval, editedEventQuery.data]);

  const form = useForm<CreateEventType>({
    initialValues: formData,
    initialErrors: getErrors(formData),
    validateInputOnChange: true,
    validate: {
      name: (value) => value ? null : "Name is required",
      location: (value) => !!value?.address ? null : "Location is required",
      start: (value) => value.getTime() > (1000 * now()) ? null : "Invalid start",
      end: (value, formData) =>
        (value.getTime() > (1000 * now()) && value.getTime() > formData.start.getTime()) ? null : "Invalid end",
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
          <Button variant="default" onClick={form.reset} disabled={!form.isDirty()}>
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
