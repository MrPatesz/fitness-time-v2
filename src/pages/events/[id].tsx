import {ActionIcon, Group, SimpleGrid, Stack, Text, useMantineTheme} from '@mantine/core';
import {openModal} from '@mantine/modals';
import {showNotification} from '@mantine/notifications';
import {useSession} from 'next-auth/react';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
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
import {UsersComponent} from '../../components/group/UsersComponent';
import {GroupBadge} from '../../components/group/GroupBadge';
import {UserBadge} from '../../components/user/UserBadge';
import {useEffect} from 'react';
import {usePathId} from '../../hooks/usePathId';
import {CenteredLoader} from '../../components/CenteredLoader';

export default function EventDetailsPage() {
  const longDateFormatter = useLongDateFormatter();
  const priceFormatter = usePriceFormatter();
  const theme = useMantineTheme();
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`);
  const md = useMediaQuery(`(min-width: ${theme.breakpoints.md}px)`);
  const {id: eventId, isReady} = usePathId<number>();
  const {data: session} = useSession();
  const {t} = useTranslation('common');

  const queryContext = api.useContext();
  const eventQuery = api.event.getById.useQuery(eventId!, {
    enabled: isReady,
  });
  const averageRatingQuery = api.rating.getAverageRatingForEvent.useQuery(eventId!, {
    enabled: isReady && eventQuery.data?.status === EventStatus.ARCHIVE,
  });
  const userRatingQuery = api.rating.getCallerRating.useQuery(eventId!, {
    enabled: isReady && eventQuery.data?.status === EventStatus.ARCHIVE,
  });
  const rate = api.rating.rate.useMutation({
    onSuccess: () => void userRatingQuery.refetch(),
  });
  const participate = api.event.participate.useMutation({
    onSuccess: () => showNotification({
      color: 'green',
      title: t('notification.event.participation.title'),
      message: t('notification.event.participation.message'),
    }),
  });

  useEffect(() => {
    if (isReady) {
      void queryContext.comment.getAllByEventId.prefetch(eventId);
    }
  }, [isReady, eventId, queryContext]);

  return !isReady ? (
    <CenteredLoader/>
  ) : (
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
              <Group>
                <Text weight="bold" size="xl">
                  {eventQuery.data.name}
                </Text>
                <UserBadge useLink user={eventQuery.data.creator}/>
                {eventQuery.data.group && ( // TODO GroupBadge and UserBadge component, how to differentiate?
                  <GroupBadge useLink group={eventQuery.data.group}/>
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
                  loading={rate.isLoading}
                >
                  <RatingComponent
                    averageRating={averageRatingQuery.data}
                    previousRating={userRatingQuery.data}
                    canRate={!(eventQuery.data.creatorId === session?.user.id || !eventQuery.data.participants.find(p => p.id === session?.user.id))}
                    onChange={(value) => rate.mutate({
                      createRating: {stars: value},
                      eventId,
                    })}
                  />
                </QueryComponent>
              )}
            </Stack>
            <Stack align="end">
              <UsersComponent
                // TODO tooltips for event join!
                //  t(isParticipated ? 'eventDetails.removeParticipation' : 'eventDetails.participate')
                users={eventQuery.data.participants}
                hideJoin={eventQuery.data.creatorId === session?.user.id || eventQuery.data.status === EventStatus.ARCHIVE}
                onJoin={(join) => participate.mutate({
                  id: eventId,
                  participate: join,
                })}
                eventLimit={eventQuery.data.limit}
              />
              {eventQuery.data.status === EventStatus.PLANNED && eventQuery.data.creatorId === session?.user.id && (
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
          <SimpleGrid cols={(md && eventQuery.data.description) ? 2 : 1}>
            <RichTextDisplay
              bordered
              scroll
              richText={eventQuery.data.description}
              maxHeight={336}
            />
            <CommentsComponent/>
          </SimpleGrid>
          <MapComponent
            size={{width: '100%', height: '100%', minHeight: 375}}
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
