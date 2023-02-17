import {Modal} from "@mantine/core";
import {FunctionComponent} from "react";
import {QueryComponent} from "../QueryComponent";
import {EventForm} from "./EventForm";
import {api} from "../../utils/api";

export const EditEventDialog: FunctionComponent<{
  open: boolean;
  onClose: () => void;
  eventId: number;
}> = ({open, onClose, eventId}) => {
  const eventQuery = api.event.getById.useQuery(eventId);
  const useUpdate = api.event.update.useMutation();

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
      >
        <EventForm
          originalEvent={eventQuery.data}
          onSubmit={(data) => {
            if (eventQuery.data) {
              useUpdate.mutateAsync({...data, id: eventId}).then(onClose);
            }
          }}
        />
      </QueryComponent>
    </Modal>
  );
};
