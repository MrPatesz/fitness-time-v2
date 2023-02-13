import {Button, Modal} from "@mantine/core";
import {FunctionComponent, useEffect, useState} from "react";
import {CreateEventType} from "../../models/Event";
import {EventForm} from "./EventForm";
import {api} from "../../utils/api";

const defaultCreateEvent = {
  name: "",
  start: new Date(),
  end: new Date(),
  description: null,
  equipment: null,
  limit: null,
  price: null,
};

export const CreateEventDialog: FunctionComponent<{
  open: boolean;
  onClose: () => void;
  defaultStart?: Date;
  defaultEnd?: Date;
}> = ({open, onClose, defaultStart, defaultEnd}) => {
  const [event, setEvent] = useState<CreateEventType>(defaultCreateEvent);
  // const utils = trpc.useContext(); TODO useContext to invalidate

  const useCreate = api.event.create.useMutation(// {
    //   onSuccess: () => {
    //   utils.event.getCalendar.invalidate();
    //   utils.event.getAllCreated.invalidate();
    //   }
    // }
  );

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
            disabled={!event?.name} // || !event?.location.address}
            onClick={() => {
              if (event) {
                useCreate.mutateAsync(event).then(() => {
                  onClose();
                  setEvent(defaultCreateEvent);
                });
              }
            }}
          >
            Create
          </Button>
        }
      />
    </Modal>
  );
};
