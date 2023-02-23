import {Modal} from "@mantine/core";
import {FunctionComponent} from "react";
import {api} from "../../../utils/api";
import {QueryComponent} from "../../QueryComponent";
import {EventForm} from "../EventForm";

export const EditEventDialog: FunctionComponent<{
  open: boolean;
  onClose: () => void;
  eventId: number;
}> = ({open, onClose, eventId}) => {
  const queryContext = api.useContext();
  const eventQuery = api.event.getById.useQuery(eventId);
  const useUpdate = api.event.update.useMutation({
    onSuccess: () => queryContext.event.invalidate(),
  });

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title="Edit Event"
      closeOnClickOutside={false}
    >
      <QueryComponent resourceName={"Event Details"} query={eventQuery}>
        {eventQuery.data && (
          <EventForm
            originalEvent={eventQuery.data}
            onSubmit={(data) =>
              useUpdate.mutateAsync({id: eventId, event: data}).then(onClose)
            }
          />
        )}
      </QueryComponent>
    </Modal>
  );
};
