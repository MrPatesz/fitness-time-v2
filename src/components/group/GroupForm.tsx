import {Button, Group, Stack, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useTranslation} from "next-i18next";
import {FunctionComponent} from "react";
import {BasicGroupType, CreateGroupType} from "../../models/Group";
import {RichTextField} from "../rich-text/RichTextField";

export const GroupForm: FunctionComponent<{
  originalGroup: CreateGroupType | BasicGroupType;
  onSubmit: (event: CreateGroupType | BasicGroupType) => void;
}> = ({originalGroup, onSubmit}) => {
  const form = useForm<CreateGroupType>({
    initialValues: originalGroup,
    validateInputOnChange: true,
    validate: {
      name: value => value.trim() ? null : t("groupForm.name.error"),
    },
  });
  const {t} = useTranslation("common");

  return (
    <form onSubmit={form.onSubmit((data) => onSubmit(data))}>
      <Stack>
        <TextInput
          withAsterisk
          data-autofocus
          label={t("common.name")}
          placeholder={t("groupForm.name.placeholder")}
          {...form.getInputProps("name")}
        />
        <RichTextField
          label={t("groupForm.description.label")}
          placeholder={t("groupForm.description.placeholder")}
          formInputProps={form.getInputProps("description")}
        />
        <Group position="right">
          <Button
            variant="default"
            onClick={() => form.reset()}
            disabled={!form.isDirty()}
          >
            {t("button.reset")}
          </Button>
          <Button type="submit" disabled={!form.isValid() || !form.isDirty()}>
            {t("button.submit")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
