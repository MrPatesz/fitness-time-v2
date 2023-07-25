import {closeAllModals} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {useTranslation} from "next-i18next";
import {api} from "../../utils/api";
import {defaultCreateGroup} from "../../utils/defaultObjects";
import {GroupForm} from "./GroupForm";

export const CreateGroupForm = () => {
  const {t} = useTranslation("common");

  const queryContext = api.useContext();
  const useCreate = api.group.create.useMutation({
    onSuccess: () => queryContext.group.invalidate().then(() => {
      closeAllModals();
      showNotification({
        color: "green",
        title: t("notification.group.create.title"),
        message: t("notification.group.create.message"),
      });
    }),
  });

  return (
    <GroupForm
      originalGroup={defaultCreateGroup}
      onSubmit={(data) => useCreate.mutate(data)}
    />
  );
};
