import {Button, Group, Stack, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {closeAllModals} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {useTranslation} from "next-i18next";
import {FunctionComponent} from "react";
import {CreateGroupType} from "../../models/Group";
import {api} from "../../utils/api";
import {defaultCreateGroup} from "../../utils/defaultObjects";
import {RichTextField} from "../rich-text/RichTextField";

export const GroupForm: FunctionComponent<{
  editedGroupId?: number;
}> = ({editedGroupId}) => {
  const {t} = useTranslation("common");

  const getErrors = (data: CreateGroupType, isCreation: boolean) => ({
    name: (isCreation || data.name) ? null : t("groupForm.name.error"),
  });

  const resetForm = (data: CreateGroupType) => {
    form.setValues(data);
    form.setErrors(getErrors(data, !editedGroupId));
  };

  const queryContext = api.useContext();
  const editedGroupQuery = api.group.getById.useQuery(editedGroupId ?? 0, {
    enabled: !!editedGroupId,
    initialData: defaultCreateGroup,
    onSuccess: resetForm,
  });

  const form = useForm<CreateGroupType>({
    initialValues: editedGroupQuery.data,
    initialErrors: getErrors(editedGroupQuery.data, !editedGroupId),
    validateInputOnChange: true,
    validate: {
      name: (value) => value ? null : t("groupForm.name.error"),
    },
  });

  const useUpdate = api.group.update.useMutation({
    onSuccess: () => queryContext.group.invalidate().then(() => {
      closeAllModals();
      showNotification({
        color: "green",
        title: t("notification.group.update.title"),
        message: t("notification.group.update.message"),
      });
    }),
  });
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

  const isFormDirty = () => JSON.stringify(form.values) !== JSON.stringify(editedGroupQuery.data);

  return (
    <form
      onSubmit={form.onSubmit((data) => {
        editedGroupId ? useUpdate.mutate({id: editedGroupId, group: data}) : useCreate.mutate(data);
      })}
    >
      <Stack>
        <TextInput
          withAsterisk
          data-autofocus
          label={t("common.name")}
          placeholder={t("groupForm.name.placeholder") as string}
          {...form.getInputProps("name")}
        />
        <RichTextField
          label={t("groupForm.description.label") as string}
          placeholder={t("groupForm.description.placeholder") as string}
          formInputProps={form.getInputProps("description")}
        />
        <Group position="right">
          <Button
            variant="default"
            onClick={() => resetForm(editedGroupQuery.data)}
            disabled={!isFormDirty()}
          >
            {t("button.reset")}
          </Button>
          <Button type="submit" disabled={!form.isValid() || !isFormDirty()}>
            {t("button.submit")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
