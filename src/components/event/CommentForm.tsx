import {ActionIcon, Button, Group, Stack, TextInput, useMantineTheme} from "@mantine/core";
import {useForm} from "@mantine/form";
import {showNotification} from "@mantine/notifications";
import {useTranslation} from "next-i18next";
import {FunctionComponent} from "react";
import {Send} from "tabler-icons-react";
import {BasicCommentType, CreateCommentType} from "../../models/Comment";
import {api} from "../../utils/api";

export const CommentForm: FunctionComponent<{
  editedComment?: BasicCommentType;
  eventId: number;
}> = ({editedComment, eventId}) => {
  const {t} = useTranslation("common");

  const form = useForm<CreateCommentType>({
    initialValues: editedComment ?? {message: ""},
    validateInputOnChange: true,
    validate: {message: (value) => value ? null : t("commentFrom.messageError")},
  });

  const theme = useMantineTheme();
  const queryContext = api.useContext();
  const createComment = api.comment.create.useMutation({
    onSuccess: () => queryContext.comment.invalidate().then(() =>
      showNotification({
        color: "green",
        title: t("notification.comment.create.title"),
        message: t("notification.comment.create.message"),
      })
    )
  });
  const updateComment = api.comment.update.useMutation({
    onSuccess: () => queryContext.comment.invalidate().then(() =>
      showNotification({
        color: "green",
        title: t("notification.comment.update.title"),
        message: t("notification.comment.update.message"),
      })
    )
  });

  const content = (
    <>
      <TextInput
        placeholder={t("commentFrom.addComment") as string}
        sx={{flexGrow: 1}}
        {...form.getInputProps("message")}
      />
      {editedComment ? (
        <Button type="submit" disabled={!form.isValid() || !form.isDirty()} sx={{marginLeft: "auto"}}>
          {t("commentFrom.update")}
        </Button>
      ) : (
        <ActionIcon
          type="submit"
          disabled={!form.isValid() || !form.isDirty()}
          size="lg"
          color={theme.primaryColor}
          variant="filled"
        >
          <Send/>
        </ActionIcon>
      )}
    </>
  );

  return (
    <form
      onSubmit={form.onSubmit((data) =>
        editedComment ?
          updateComment.mutate({commentId: editedComment.id, comment: data, eventId}) :
          createComment.mutate({createComment: data, eventId})
      )}
    >
      {editedComment ? (
        <Stack>
          {content}
        </Stack>
      ) : (
        <Group>
          {content}
        </Group>
      )}
    </form>
  );
};
