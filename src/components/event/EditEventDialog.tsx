import {Button, Modal} from "@mantine/core";
import React, {useState} from "react";
import {EventType} from "../../models/Event";
import {QueryComponent} from "../QueryComponent";
import {EventForm} from "./EventForm";

export const EditEventDialog: React.FunctionComponent<{
  open: boolean;
  onClose: () => void;
  eventId: number;
}> = ({open, onClose, eventId}) => {
  return <>Edit Event Dialog</>;

  const [event, setEvent] = useState<EventType | undefined>(undefined);

  const eventService: any = undefined; // EventService();
  const useUpdate = eventService.useUpdate();
  const eventQuery = eventService.useGetSingle(eventId);

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title="Edit Event"
      closeOnClickOutside={false}
    >
      <QueryComponent
        resourceName={"Event Details"}
        query={eventQuery}
        setState={setEvent}
      >
        <EventForm
          event={event}
          setEvent={setEvent}
          submitButton={
            <Button
              disabled={!event?.name || !event?.location.address}
              onClick={() => useUpdate.mutateAsync(event).then(onClose)}
            >
              Update
            </Button>
          }
        />
      </QueryComponent>
    </Modal>
  );
};
