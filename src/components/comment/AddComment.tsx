import {ActionIcon, Group, TextInput, useMantineTheme} from "@mantine/core";
import {useForm} from "@mantine/form";
import {openModal} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {useTranslation} from "next-i18next";
import {FunctionComponent} from "react";
import {PencilPlus, Send} from "tabler-icons-react";
import {CreateCommentType} from "../../models/Comment";
import {api} from "../../utils/api";
import {CommentForm} from "./CommentForm";

export const AddComment: FunctionComponent<{
  eventId: number;
}> = ({eventId}) => {
  const {t} = useTranslation("common");

  const form = useForm<CreateCommentType>({
    initialValues: {message: ""},
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

  return (
    <form onSubmit={form.onSubmit((data) => createComment.mutate({createComment: data, eventId}))}>
      <Group>
        <TextInput
          placeholder={t("commentFrom.addComment") as string}
          sx={{flexGrow: 1}}
          {...form.getInputProps("message")}
          rightSection={(
            <ActionIcon
              onClick={() => openModal({
                title: t("modal.comment.create"),
                zIndex: 401,
                closeOnClickOutside: false,
                children: <CommentForm eventId={eventId} editedComment={form.values}/>,
                size: "xl"
              })}
            >
              <PencilPlus/>
            </ActionIcon>
          )}
        />
        <ActionIcon
          type="submit"
          disabled={!form.isValid() || !form.isDirty()}
          size={36}
          color={theme.primaryColor}
          variant="filled"
        >
          <Send/>
        </ActionIcon>
      </Group>
    </form>
  );
};
