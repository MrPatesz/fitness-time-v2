import {Button, Group, Stack, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {showNotification} from "@mantine/notifications";
import {FunctionComponent} from "react";
import {BasicCommentType, CreateCommentType} from "../../models/Comment";
import {api} from "../../utils/api";

export const CommentForm: FunctionComponent<{
  editedComment?: BasicCommentType;
  eventId: number;
}> = ({editedComment, eventId}) => {
  const form = useForm<CreateCommentType>({
    initialValues: editedComment ?? {message: ""},
    validateInputOnChange: true,
    validate: {message: (value) => value ? null : "Message is required"},
  });

  const queryContext = api.useContext();
  const createComment = api.comment.create.useMutation({
    onSuccess: () => queryContext.event.invalidate().then(() =>
      showNotification({
        color: "green",
        title: "Created comment!",
        message: "A new comment has been created."
      })
    )
  });
  const updateComment = api.comment.update.useMutation({
    onSuccess: () => queryContext.event.invalidate().then(() =>
      showNotification({
        color: "green",
        title: "Updated comment!",
        message: "The comment has been modified.",
      })
    )
  });

  const content = (
    <>
      <TextInput
        placeholder="Add comment..."
        sx={{flexGrow: 1}}
        {...form.getInputProps("message")}
      />
      <Group sx={{marginBottom: "auto"}} position="right">
        {editedComment && (
          <Button
            variant="default"
            onClick={form.reset}
            disabled={!form.isDirty()}
          >
            Reset
          </Button>
        )}
        <Button type="submit" disabled={!form.isValid() || !form.isDirty()}>
          {editedComment ? "Update" : "Comment"}
        </Button>
      </Group>
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
