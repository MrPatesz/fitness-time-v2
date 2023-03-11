import {ActionIcon, Affix, Badge, Button, Card, Group, Stack, Text, Tooltip, useMantineTheme,} from "@mantine/core";
import {openConfirmModal, openModal} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {useSession} from "next-auth/react";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Link from "next/link";
import {useRouter} from "next/router";
import {Pencil, Trash} from "tabler-icons-react";
import i18nConfig from "../../../next-i18next.config.mjs";
import {CommentForm} from "../../components/event/CommentForm";
import {EventForm} from "../../components/event/EventForm";
import MapComponent from "../../components/location/MapComponent";
import {QueryComponent} from "../../components/QueryComponent";
import UserImage from "../../components/user/UserImage";
import {DetailedEventType} from "../../models/Event";
import {api} from "../../utils/api";
import dayjs from "../../utils/dayjs";
import {getLongDateFormatter, getPriceFormatter} from "../../utils/formatters";
import {getBackgroundColor} from "../../utils/utilFunctions";

export default function EventDetailsPage() {
  const theme = useMantineTheme();
  const {query: {id}, isReady, locale} = useRouter();
  const {data: session} = useSession();
  const {t} = useTranslation("common");
  const longDateFormatter = getLongDateFormatter(locale as string);
  const priceFormatter = getPriceFormatter(locale as string);

  const eventId = parseInt(id as string);
  const eventQuery = api.event.getById.useQuery(eventId, {
    enabled: isReady,
  });
  const commentsQuery = api.comment.getAllByEventId.useQuery(eventId, {
    enabled: isReady,
  });

  const participate = api.event.participate.useMutation({
    onSuccess: () => eventQuery.refetch().then(() =>
      showNotification({
        color: "green",
        title: t("notification.event.participation.title"),
        message: t("notification.event.participation.message"),
      })
    ),
  });

  const deleteComment = api.comment.delete.useMutation({
    onSuccess: () => commentsQuery.refetch().then(() =>
      showNotification({
        color: "green",
        title: t("notification.comment.delete.title"),
        message: t("notification.comment.delete.message"),
      })
    )
  });

  const participateButton = (event: DetailedEventType) => {
    if (event.creatorId === session?.user.id) {
      return;
    }

    const isParticipated = !!event.participants.find(p => p.id === session?.user.id);

    if (!isParticipated && event.limit && (event.participants.length >= event.limit)) {
      return;
    }

    return (
      <Button
        onClick={() => participate.mutate({
          id: eventId,
          participate: !isParticipated,
        })}
      >
        {isParticipated ? t("eventDetails.removeParticipation") : t("eventDetails.participate")}
      </Button>
    );
  };

  return (
    <Stack>
      <QueryComponent resourceName={t("resource.eventDetails")} query={eventQuery}>
        {eventQuery.data && (
          <Stack>
            <Group align="start" position="apart">
              <Stack>
                <Group align="end">
                  <Text weight="bold" size="xl">
                    {eventQuery.data.name}
                  </Text>
                  <Link
                    href={`/users/${eventQuery.data.creator.id}`}
                    locale={locale}
                    passHref
                  >
                    <Text color="dimmed">
                      {eventQuery.data.creator.name}
                    </Text>
                  </Link>
                </Group>
                <Group spacing="xs">
                  <Text>
                    {longDateFormatter.formatRange(eventQuery.data.start, eventQuery.data.end)}
                  </Text>
                </Group>
                <Text color="dimmed">{eventQuery.data.description}</Text>
                {eventQuery.data.equipment && (
                  <Group spacing="xs">
                    <Text>
                      {t("eventDetails.requiredEquipment")}
                    </Text>
                    <Text underline>
                      {eventQuery.data.equipment}
                    </Text>
                  </Group>
                )}
                {eventQuery.data.price && (
                  <Group spacing="xs">
                    <Text>
                      {t("common.price")}:
                    </Text>
                    <Text weight="bold">{priceFormatter.format(eventQuery.data.price)}</Text>
                  </Group>
                )}
              </Stack>
              <MapComponent location={eventQuery.data.location}/>
            </Group>
            <Card withBorder>
              <Stack>
                <Group position="apart">
                  <Group spacing="xs">
                    {eventQuery.data.limit && (
                      <Badge color="red">
                        {eventQuery.data.participants.length}/{eventQuery.data.limit}
                      </Badge>
                    )}
                    <Text>
                      {!!eventQuery.data.participants.length ?
                        t("eventDetails.participants") :
                        t("eventDetails.noParticipants")}
                    </Text>
                  </Group>
                  {participateButton(eventQuery.data)}
                </Group>
                {!!eventQuery.data.participants.length && (
                  <Group spacing="xs">
                    {eventQuery.data.participants.map((p, index: number) => (
                      <Link
                        href={`/users/${p.id}`}
                        locale={locale}
                        passHref
                        key={p.id}
                      >
                        <Text sx={{cursor: "pointer"}}>
                          {p.name}
                          {index !== eventQuery.data.participants.length - 1 && ","}
                        </Text>
                      </Link>
                    ))}
                  </Group>
                )}
              </Stack>
            </Card>
          </Stack>
        )}
      </QueryComponent>
      <QueryComponent resourceName={t("resource.comments")} query={commentsQuery}>
        <Card
          withBorder sx={{
          backgroundColor: getBackgroundColor(theme),
        }}
        >
          <Stack>
            <CommentForm eventId={eventId}/>
            {commentsQuery.data?.map(c => (
              <Card withBorder key={c.id}>
                <Group position="apart" align="start">
                  <Group>
                    <UserImage user={c.user} size={45}/>
                    <Stack spacing="xs">
                      <Link href={`/users/${c.user.id}`} locale={locale} passHref>
                        <Text weight="bold">
                          {c.user.name}
                        </Text>
                      </Link>
                      <Text /*TODO handle long message*/>
                        {c.message}
                      </Text>
                    </Stack>
                  </Group>
                  <Stack justify="apart">
                    <Group position="right" spacing="xs">
                      {c.userId === session?.user.id && (
                        <>
                          <ActionIcon
                            size="sm"
                            onClick={() => openModal({
                              title: t("modal.comment.edit"),
                              zIndex: 401,
                              closeOnClickOutside: false,
                              children: <CommentForm eventId={eventId} editedComment={c}/>,
                            })}
                          >
                            <Pencil/>
                          </ActionIcon>
                          <ActionIcon
                            size="sm"
                            onClick={() => openConfirmModal({
                              title: t("modal.comment.delete.title"),
                              children: (
                                <Stack>
                                  <Text>
                                    {t("modal.comment.delete.message")}
                                  </Text>
                                  <Text weight="bold">
                                    "{c.message}"
                                  </Text>
                                </Stack>
                              ),
                              labels: {confirm: t("button.confirm"), cancel: t("button.cancel")},
                              onConfirm: () => deleteComment.mutate(c.id),
                              zIndex: 401,
                            })}
                          >
                            <Trash/>
                          </ActionIcon>
                        </>
                      )}
                    </Group>
                    <Tooltip
                      label={getLongDateFormatter(locale as string).format(c.postedAt)}
                      color={theme.primaryColor}
                    >
                      <Text>
                        {dayjs(c.postedAt).fromNow()}
                      </Text>
                    </Tooltip>
                  </Stack>
                </Group>
              </Card>
            ))}
          </Stack>
        </Card>
      </QueryComponent>
      {eventQuery.data?.creatorId === session?.user.id && (
        <Affix position={{bottom: theme.spacing.md, right: theme.spacing.md}}>
          <ActionIcon
            variant="default"
            size="xl"
            onClick={() => openModal({
              title: t("modal.event.edit"),
              zIndex: 401,
              closeOnClickOutside: false,
              children: <EventForm editedEventId={eventId}/>,
            })}
          >
            <Pencil/>
          </ActionIcon>
        </Affix>
      )}
    </Stack>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
