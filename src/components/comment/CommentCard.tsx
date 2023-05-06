import {ActionIcon, Card, Group, Stack, Text, Tooltip, useMantineTheme} from "@mantine/core";
import {openConfirmModal, openModal} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {useSession} from "next-auth/react";
import {useTranslation} from "next-i18next";
import Link from "next/link";
import {useRouter} from "next/router";
import {FunctionComponent} from "react";
import {Pencil, Trash} from "tabler-icons-react";
import {BasicCommentType} from "../../models/Comment";
import {api} from "../../utils/api";
import dayjs from "../../utils/dayjs";
import {getLongDateFormatter} from "../../utils/formatters";
import {RichTextDisplay} from "../rich-text/RichTextDisplay";
import UserImage from "../user/UserImage";
import {CommentForm} from "./CommentForm";
import {BasicMessageType} from "../../models/Message";

export const CommentCard: FunctionComponent<{
  comment: BasicCommentType | BasicMessageType;
}> = ({comment}) => {
  const queryContext = api.useContext();
  const theme = useMantineTheme();
  const {locale = "en"} = useRouter();
  const {data: session} = useSession();
  const {t} = useTranslation("common");

  const deleteComment = api.comment.delete.useMutation({
    onSuccess: () => queryContext.comment.invalidate().then(() =>
      showNotification({
        color: "green",
        title: t("notification.comment.delete.title"),
        message: t("notification.comment.delete.message"),
      })
    )
  });

  return (
    <Card withBorder key={comment.id}>
      <Stack spacing="xs">
        <Group position="apart" align="start">
          <Group>
            <UserImage user={comment.user} size={53.6}/>
            <Stack spacing={4}>
              <Link href={`/users/${comment.user.id}`} locale={locale} passHref>
                <Text weight="bold">
                  {comment.user.name}
                </Text>
              </Link>
              <Tooltip
                label={getLongDateFormatter(locale).format(comment.postedAt)}
                color={theme.primaryColor}
                position="right"
              >
                <Text color="dimmed" sx={{width: "fit-content"}}>
                  {dayjs(comment.postedAt).fromNow()}
                </Text>
              </Tooltip>
            </Stack>
          </Group>
          {"eventId" in comment && comment.userId === session?.user.id && (
            <Group position="right" spacing="xs">
              <ActionIcon
                size="sm"
                variant="transparent"
                onClick={() => openModal({
                  title: t("modal.comment.edit"),
                  children: <CommentForm eventId={comment.eventId} editedComment={comment}/>,
                  size: "xl"
                })}
              >
                <Pencil/>
              </ActionIcon>
              <ActionIcon
                size="sm"
                variant="transparent"
                onClick={() => openConfirmModal({
                  title: t("modal.comment.delete.title"),
                  children: (
                    <Stack>
                      <Text>
                        {t("modal.comment.delete.message")}
                      </Text>
                      <Card withBorder>
                        <RichTextDisplay richText={comment.message} maxHeight={100}/>
                      </Card>
                    </Stack>
                  ),
                  labels: {confirm: t("button.confirm"), cancel: t("button.cancel")},
                  onConfirm: () => deleteComment.mutate(comment.id),
                })}
              >
                <Trash/>
              </ActionIcon>
            </Group>
          )}
        </Group>
        <RichTextDisplay richText={comment.message} maxHeight={100}/>
      </Stack>
    </Card>
  );
};
