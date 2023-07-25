import {closeAllModals} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {useTranslation} from "next-i18next";
import {FunctionComponent} from "react";
import {api} from "../../utils/api";
import {EventForm} from "./EventForm";
import {QueryComponent} from "../QueryComponent";

export const EditEventForm: FunctionComponent<{
  eventId: number;
}> = ({eventId}) => {
  const {t} = useTranslation("common");

  const queryContext = api.useContext();
  const editedEventQuery = api.event.getById.useQuery(eventId, {
    refetchOnMount: (query) => !query.isActive(),
  });

  const useUpdate = api.event.update.useMutation({
    onSuccess: () => queryContext.event.invalidate().then(() => {
      closeAllModals();
      showNotification({
        color: "green",
        title: t("notification.event.update.title"),
        message: t("notification.event.update.message"),
      });
    }),
  });

  return (
    <QueryComponent
      query={editedEventQuery}
      resourceName={t("resource.eventDetails")}
    >
      {editedEventQuery.data && (
        <EventForm
          originalEvent={editedEventQuery.data}
          onSubmit={(data) => useUpdate.mutate({
            id: eventId,
            event: {...data, price: data.price ?? null, limit: data.limit ?? null},
          })}
        />
      )}
    </QueryComponent>
  );
};
