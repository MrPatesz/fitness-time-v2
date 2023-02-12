import {Button, Modal} from "@mantine/core";
import React, {useEffect, useState} from "react";
import {EventType} from "../../models/Event";
import {EventForm} from "./EventForm";

export const CreateEventDialog: React.FunctionComponent<{
  open: boolean;
  onClose: () => void;
  defaultStart?: Date;
  defaultEnd?: Date;
}> = ({open, onClose, defaultStart, defaultEnd}) => {
  return <>Create Event Dialog</>;

  const [event, setEvent] = useState<EventType | undefined>(undefined);

  const eventService: any = undefined; // EventService();
  const useCreate = eventService.useCreate();

  useEffect(() => {
    if (event && defaultStart && defaultEnd) {
      setEvent({...event, start: defaultStart, end: defaultEnd});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultStart, defaultEnd]);

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title="Create Event"
      closeOnClickOutside={false}
    >
      <EventForm
        event={event}
        setEvent={setEvent}
        submitButton={
          <Button
            disabled={!event?.name || !event?.location.address}
            onClick={() => {
              useCreate.mutateAsync(event).then(() => {
                onClose();
                setEvent(undefined);
              });
            }}
          >
            Create
          </Button>
        }
      />
    </Modal>
  );
};
