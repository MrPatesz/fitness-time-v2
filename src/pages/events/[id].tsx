import {ActionIcon, Affix, Badge, Button, Card, Group, Stack, Text, useMantineTheme,} from "@mantine/core";
import {openConfirmModal, openModal} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {useSession} from "next-auth/react";
import Link from "next/link";
import {useRouter} from "next/router";
import {Pencil, Trash} from "tabler-icons-react";
import {CommentForm} from "../../components/event/CommentForm";
import {EventForm} from "../../components/event/EventForm";
import MapComponent from "../../components/location/MapComponent";
import {QueryComponent} from "../../components/QueryComponent";
import UserImage from "../../components/user/UserImage";
import {DetailedEventType} from "../../models/Event";
import {api} from "../../utils/api";
import {dateFormatter, priceFormatter} from "../../utils/formatters";

dayjs.extend(relativeTime);

export default function EventDetailsPage() {
  const theme = useMantineTheme();
  const {data: session} = useSession();
  const {query: {id}} = useRouter();

  const eventQuery = api.event.getById.useQuery(+`${id}`);
  const participate = api.event.participate.useMutation({
    onSuccess: () => eventQuery.refetch().then(() =>
      showNotification({
        color: "green",
        title: "Updated participation!",
        message: "Your participation status has been modified.",
      })
    ),
  });

  const deleteComment = api.comment.delete.useMutation({
    onSuccess: () => eventQuery.refetch().then(() =>
      showNotification({
        color: "green",
        title: "Deleted comment!",
        message: "The comment has been deleted."
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
          id: +`${id}`,
          participate: !isParticipated,
        })}
      >
        {isParticipated ? "Remove participation" : "Participate"}
      </Button>
    );
  };

  const limitBadge = () => {
    if (eventQuery.data?.limit) {
      return (
        <Badge color={"red"}>
          {eventQuery.data.participants.length}/{eventQuery.data.limit}
        </Badge>
      );
    }
  };

  return (
    <>
      <QueryComponent resourceName={"Event Details"} query={eventQuery}>
        {eventQuery.data && (
          <Stack>
            <Group align={"start"} position={"apart"}>
              <Stack>
                <Group align={"end"}>
                  <Text weight="bold" size="xl">
                    {eventQuery.data.name}
                  </Text>
                  <Link
                    href={"/users/[id]"}
                    as={`/users/${eventQuery.data.creator.id}`}
                    passHref
                  >
                    <Text size="lg">
                      by {eventQuery.data.creator.name}
                    </Text>
                  </Link>
                </Group>
                <Group spacing="xs">
                  <Text>
                    {dateFormatter.formatRange(eventQuery.data.start, eventQuery.data.end)}
                  </Text>
                </Group>
                {eventQuery.data.description && (
                  <Text inherit>{eventQuery.data.description}</Text>
                )}
                {eventQuery.data.equipment && (
                  <Text weight={"bold"}>
                    {eventQuery.data.equipment} shall be brought to the event!
                  </Text>
                )}
                {eventQuery.data.price && (
                  <Text>Price: {priceFormatter.format(eventQuery.data.price)}</Text>
                )}
              </Stack>
              <MapComponent location={eventQuery.data.location}/>
            </Group>
            <Card withBorder shadow="md" p="lg">
              {!!eventQuery.data.participants.length ? (
                <Stack>
                  <Group position="apart">
                    <Group spacing={"xs"}>
                      {limitBadge()}
                      <Text>They will also be there:</Text>
                    </Group>
                    {participateButton(eventQuery.data)}
                  </Group>
                  <Group spacing="xs">
                    {eventQuery.data.participants.map((p, index: number) => (
                      <Link
                        href={"/users/[id]"}
                        as={`/users/${p.id}`}
                        passHref
                        key={p.id}
                      >
                        <Text sx={{cursor: "pointer"}}>
                          {p.name}
                          {index !==
                            eventQuery.data.participants.length - 1 && <>,</>}
                        </Text>
                      </Link>
                    ))}
                  </Group>
                </Stack>
              ) : (
                <Group position="apart">
                  <Group spacing={"xs"}>
                    {limitBadge()}
                    <Text>There are no participants yet.</Text>
                  </Group>
                  {participateButton(eventQuery.data)}
                </Group>
              )}
            </Card>
            <Card withBorder sx={{backgroundColor: theme.colors.dark[9]}}>
              <Stack>
                <CommentForm eventId={+`${id}`}/>
                {eventQuery.data.comments.map(c => (
                  <Card withBorder key={c.id}>
                    <Group position="apart" align="start">
                      <Group>
                        <UserImage user={c.user} size={45}/>
                        <Stack spacing="xs">
                          <Link
                            href={"/users/[id]"}
                            as={`/users/${c.user.id}`}
                            passHref
                          >
                            <Text weight="bold">
                              {c.user.name}
                            </Text>
                          </Link>
                          <Text>
                            {c.message}
                          </Text>
                        </Stack>
                      </Group>
                      <Stack justify={"apart"}>
                        <Group position={"right"} spacing={"xs"}>
                          {c.userId === session?.user.id && (
                            <>
                              <ActionIcon
                                size="sm"
                                onClick={() => openModal({
                                  title: "Edit Comment",
                                  zIndex: 401,
                                  closeOnClickOutside: false,
                                  children: <CommentForm eventId={+`${id}`} editedComment={c}/>,
                                })}
                              >
                                <Pencil/>
                              </ActionIcon>
                              <ActionIcon
                                size="sm"
                                onClick={() => openConfirmModal({
                                  title: "Delete",
                                  children: (
                                    <Stack>
                                      <Text>
                                        Are you sure you want to delete this comment?
                                      </Text>
                                      <Text weight="bold">
                                        "{c.message}"
                                      </Text>
                                    </Stack>
                                  ),
                                  labels: {confirm: "Confirm", cancel: "Cancel"},
                                  onConfirm: () => deleteComment.mutate(c.id),
                                  zIndex: 401,
                                })}
                              >
                                <Trash/>
                              </ActionIcon>
                            </>
                          )}
                        </Group>
                        <Text>
                          {dayjs(c.postedAt).fromNow()}
                        </Text>
                      </Stack>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Card>
          </Stack>
        )}
      </QueryComponent>
      {eventQuery.data?.creatorId === session?.user.id && (
        <Affix position={{bottom: theme.spacing.md, right: theme.spacing.md}}>
          <ActionIcon
            variant="default"
            size="xl"
            onClick={() => openModal({
              title: "Edit Event",
              zIndex: 401,
              closeOnClickOutside: false,
              children: <EventForm editedEventId={+`${id}`}/>,
            })}
          >
            <Pencil/>
          </ActionIcon>
        </Affix>
      )}
    </>
  );
}
