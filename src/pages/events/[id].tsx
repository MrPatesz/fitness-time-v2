import {ActionIcon, Badge, Button, Card, Group, Stack, Text, useMantineTheme} from "@mantine/core";
import {openModal} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {useSession} from "next-auth/react";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Link from "next/link";
import {useRouter} from "next/router";
import {Pencil} from "tabler-icons-react";
import i18nConfig from "../../../next-i18next.config.mjs";
import {AddComment} from "../../components/comment/AddComment";
import {CommentCard} from "../../components/comment/CommentCard";
import {EventForm} from "../../components/event/EventForm";
import MapComponent from "../../components/location/MapComponent";
import {QueryComponent} from "../../components/QueryComponent";
import {RichTextDisplay} from "../../components/rich-text/RichTextDisplay";
import {DetailedEventType} from "../../models/event/Event";
import {api} from "../../utils/api";
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

  const defaultSpacing = "md";
  const defaultSpacingSize: number = theme.spacing[defaultSpacing];
  const mapSize = 400; // TODO responsive map size
  const descriptionMaxHeight = mapSize - (34 + 24.8 + (2 + 2) * defaultSpacingSize + 2 * 0.8 + 24.8);
  // eventName + eventDate + Stack spacing + card padding + card borders + show/hide label

  const participate = api.event.participate.useMutation({
    onSuccess: () => eventQuery.refetch().then(() =>
      showNotification({
        color: "green",
        title: t("notification.event.participation.title"),
        message: t("notification.event.participation.message"),
      })
    ),
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
            <Group spacing={defaultSpacing} align="start" position="apart">
              <Stack
                spacing={defaultSpacing}
                sx={{flexGrow: 1, minWidth: mapSize}}
              >
                <Group position="apart">
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
                  {eventQuery.data?.creatorId === session?.user.id && (
                    <ActionIcon
                      size="lg"
                      variant="filled"
                      color={theme.fn.themeColor(theme.primaryColor)}
                      onClick={() => openModal({
                        title: t("modal.event.edit"),
                        children: <EventForm editedEventId={eventId}/>,
                      })}
                    >
                      <Pencil/>
                    </ActionIcon>
                  )}
                </Group>
                <Group position="apart">
                  <Text>
                    {longDateFormatter.formatRange(eventQuery.data.start, eventQuery.data.end)}
                  </Text>
                  {eventQuery.data.price && (
                    <Group spacing="xs">
                      <Text>
                        {t("common.price")}:
                      </Text>
                      <Text weight="bold">{priceFormatter.format(eventQuery.data.price)}</Text>
                    </Group>
                  )}
                </Group>
                {eventQuery.data.description && (
                  <Card p={defaultSpacing} withBorder sx={{backgroundColor: getBackgroundColor(theme)}}>
                    <RichTextDisplay richText={eventQuery.data.description} maxHeight={descriptionMaxHeight}/>
                  </Card>
                )}
              </Stack>
              <MapComponent
                size={{width: mapSize, height: mapSize}}
                location={eventQuery.data.location}
              />
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
        <Card withBorder sx={{backgroundColor: getBackgroundColor(theme)}}>
          <Stack>
            <AddComment eventId={eventId}/>
            {commentsQuery.data?.map(c => (
              <CommentCard key={c.id} comment={c}/>
            ))}
          </Stack>
        </Card>
      </QueryComponent>
    </Stack>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
