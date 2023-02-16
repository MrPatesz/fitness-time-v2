import {Button, Modal} from "@mantine/core";
import {FunctionComponent, useState} from "react";
import {EventType} from "../../models/Event";
import {QueryComponent} from "../QueryComponent";
import {EventForm} from "./EventForm";
import {api} from "../../utils/api";

export const EditEventDialog: FunctionComponent<{
  open: boolean;
  onClose: () => void;
  eventId: number;
}> = ({open, onClose, eventId}) => {
  const [event, setEvent] = useState<EventType | undefined>(undefined);

  const useUpdate = api.event.update.useMutation();
  const eventQuery = api.event.getById.useQuery(eventId);

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
          setEvent={createEvent => {
            if (event) {
              setEvent({...event, ...createEvent});
            }
          }}
          submitButton={
            <Button
              disabled={!event?.name/* || !event?.location.address*/}
              onClick={() => {
                if (event) {
                  useUpdate.mutateAsync(event).then(onClose);
                }
              }}
            >
              Update
            </Button>
          }
        />
      </QueryComponent>
    </Modal>
  );
};
