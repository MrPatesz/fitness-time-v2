import {ActionIcon, Group, SimpleGrid, Stack, Text, useMantineTheme} from '@mantine/core';
import {openModal} from '@mantine/modals';
import {showNotification} from '@mantine/notifications';
import {useSession} from 'next-auth/react';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import {useRouter} from 'next/router';
import {Pencil} from 'tabler-icons-react';
import i18nConfig from '../../../next-i18next.config.mjs';
import MapComponent from '../../components/location/MapComponent';
import {QueryComponent} from '../../components/QueryComponent';
import {RatingComponent} from '../../components/RatingComponent';
import {RichTextDisplay} from '../../components/rich-text/RichTextDisplay';
import {api} from '../../utils/api';
import {EventStatus, InvalidateEvent} from '../../utils/enums';
import {useLongDateFormatter, usePriceFormatter} from '../../utils/formatters';
import {EditEventForm} from '../../components/event/EditEventForm';
import {CommentsComponent} from '../../components/event/CommentsComponent';
import {useMediaQuery} from '@mantine/hooks';
import {MembersComponent} from '../../components/group/MembersComponent';
import {GroupBadge} from '../../components/group/GroupBadge';
import {UserBadge} from '../../components/user/UserBadge';
import {useEffect} from 'react';

export default function EventDetailsPage() {
  const theme = useMantineTheme();
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`);
  const md = useMediaQuery(`(min-width: ${theme.breakpoints.md}px)`);
  const {query: {id}, isReady} = useRouter();
  const {data: session} = useSession();
  const {t} = useTranslation('common');
  const longDateFormatter = useLongDateFormatter();
  const priceFormatter = usePriceFormatter();
  const queryContext = api.useContext();

  const eventId = parseInt(id as string);
  const eventQuery = api.event.getById.useQuery(eventId, {
    enabled: isReady,
  });
  const averageRatingQuery = api.rating.getAverageRatingForEvent.useQuery(eventId, {
    enabled: isReady && eventQuery.data?.status === EventStatus.ARCHIVE,
  });
  const userRatingQuery = api.rating.getCallerRating.useQuery(eventId, {
    enabled: isReady && eventQuery.data?.status === EventStatus.ARCHIVE,
  });
  const rateEvent = api.rating.rate.useMutation({
    onSuccess: () => void userRatingQuery.refetch(),
  });
  const participate = api.event.participate.useMutation({
    onSuccess: () => showNotification({
      color: 'green',
      title: t('notification.event.participation.title'),
      message: t('notification.event.participation.message'),
    }),
  });

  const editable = eventQuery.data?.status === EventStatus.PLANNED && eventQuery.data?.creatorId === session?.user.id;

  useEffect(() => {
    if (isReady) {
      void queryContext.comment.getAllByEventId.prefetch(eventId);
    }
  }, [isReady, eventId, queryContext]);

  return (
    <QueryComponent
      resourceName={t('resource.eventDetails')}
      query={eventQuery}
      eventInfo={{event: InvalidateEvent.EventGetById, id: eventId}}
      loading={participate.isLoading}
    >
      {eventQuery.data && (
        <Stack h="100%">
          <Group position="apart" align="start">
            <Stack>
              <Group align="end">
                <Text weight="bold" size="xl">
                  {eventQuery.data.name}
                </Text>
                <UserBadge user={eventQuery.data.creator}/>
                {eventQuery.data.group && ( // TODO GroupBadge and UserBadge component, how to differentiate?
                  <GroupBadge group={eventQuery.data.group}/>
                )}
              </Group>
              <Text>
                {longDateFormatter.formatRange(eventQuery.data.start, eventQuery.data.end)}
              </Text>
              {eventQuery.data.price && (
                <Group spacing="xs">
                  <Text>
                    {t('common.price')}:
                  </Text>
                  <Text weight="bold">{priceFormatter.format(eventQuery.data.price)}</Text>
                </Group>
              )}
              {eventQuery.data.status === EventStatus.ARCHIVE && (
                <QueryComponent
                  resourceName={t('resource.rating')}
                  query={averageRatingQuery}
                  eventInfo={{event: InvalidateEvent.RatingGetAverageRatingForEvent, id: eventId}}
                  loading={rateEvent.isLoading}
                >
                  <RatingComponent
                    averageRating={averageRatingQuery.data}
                    previousRating={userRatingQuery.data}
                    canRate={!(eventQuery.data.creatorId === session?.user.id || !eventQuery.data.participants.find(p => p.id === session?.user.id))}
                    onChange={(value) => rateEvent.mutate({
                      createRating: {stars: value},
                      eventId,
                    })}
                  />
                </QueryComponent>
              )}
            </Stack>
            <Stack align="end">
              <MembersComponent
                // TODO show limit!
                //  {eventQuery.data.limit && (
                //    <Badge color="red">
                //      {eventQuery.data.participants.length}/{eventQuery.data.limit}
                //    </Badge>
                //  )}
                // TODO tooltips for event join!
                //  t(isParticipated ? 'eventDetails.removeParticipation' : 'eventDetails.participate')
                // TODO disable join button when event if full!
                //  !isParticipated && event.limit && (event.participants.length >= event.limit)
                members={eventQuery.data.participants}
                isCreator={eventQuery.data.creatorId === session?.user.id || eventQuery.data.status === EventStatus.ARCHIVE}
                onJoin={(join) => participate.mutate({
                  id: eventId,
                  participate: join,
                })}
              />
              {editable && (
                <ActionIcon
                  title={t('modal.event.edit')}
                  size="lg"
                  variant="filled"
                  color={theme.fn.themeColor(theme.primaryColor)}
                  onClick={() => openModal({
                    title: t('modal.event.edit'),
                    children: <EditEventForm eventId={eventId}/>,
                    fullScreen: !xs,
                  })}
                >
                  <Pencil/>
                </ActionIcon>
              )}
            </Stack>
          </Group>
          <SimpleGrid
            cols={md ? 2 : 1}
            sx={{flexGrow: 1}}
          >
            <RichTextDisplay // TODO maxHeight is wrong
              bordered
              scroll
              richText={eventQuery.data.description}
              maxHeight={300}
            />
            <CommentsComponent/>
          </SimpleGrid>
          <MapComponent
            size={{width: '100%', height: 375}}
            location={eventQuery.data.location}
            distance={eventQuery.data.distance}
          />
        </Stack>
      )}
    </QueryComponent>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ['common'], i18nConfig))},
});
