import {Modal} from "@mantine/core";
import {FunctionComponent} from "react";
import {CreateEventType} from "../../models/Event";
import {api} from "../../utils/api";
import {EventForm} from "./EventForm";

const defaultCreateEvent: CreateEventType = {
  name: "",
  start: new Date(),
  end: new Date(),
  description: "",
  equipment: "",
  limit: null,
  price: null,
};

export const CreateEventDialog: FunctionComponent<{
  open: boolean;
  onClose: () => void;
  initialInterval?: {
    start: Date;
    end: Date;
  };
}> = ({open, onClose, initialInterval}) => {
  const queryContext = api.useContext();
  const useCreate = api.event.create.useMutation({
    onSuccess: () => queryContext.event.invalidate(),
  });

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title="Create Event"
      closeOnClickOutside={false}
    >
      <EventForm
        originalEvent={
          initialInterval ? {
            ...defaultCreateEvent,
            start: initialInterval.start,
            end: initialInterval.end
          } : undefined
        }
        onSubmit={(data) => useCreate.mutateAsync(data).then(onClose)}
      />
    </Modal>
  );
};
