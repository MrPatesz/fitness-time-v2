import {ActionIcon, Box, Card, Group, ScrollArea, Stack, Text, useMantineTheme} from '@mantine/core';
import {useIntersection, useMediaQuery} from '@mantine/hooks';
import {openModal} from '@mantine/modals';
import {useTranslation} from 'next-i18next';
import {FunctionComponent, useEffect, useMemo} from 'react';
import {Plus} from 'tabler-icons-react';
import {BasicEventType} from '../../models/Event';
import {api} from '../../utils/api';
import {getBackgroundColor} from '../../utils/utilFunctions';
import {CenteredLoader} from '../CenteredLoader';
import {EventCard} from '../event/EventCard';
import {CreateEventForm} from '../event/CreateEventForm';
import {QueryComponent} from '../QueryComponent';
import {InvalidateEvent} from '../../utils/enums';

export const GroupFeed: FunctionComponent<{
  groupId: number;
}> = ({groupId}) => {
  const theme = useMantineTheme();
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`);
  const {t} = useTranslation('common');
  const {ref, entry} = useIntersection({threshold: 0.1});

  const eventsQuery = api.event.getFeed.useInfiniteQuery({groupId}, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    if (entry?.isIntersecting && eventsQuery.hasNextPage && !eventsQuery.isFetching) {
      void eventsQuery.fetchNextPage();
    }
  }, [entry]);

  const events: BasicEventType[] = useMemo(() => {
    return eventsQuery.data?.pages.flatMap(page => page.events) ?? [];
  }, [eventsQuery.data?.pages]);

  return (
    <Card
      withBorder
      sx={theme => ({
        backgroundColor: getBackgroundColor(theme),
        height: '100%',
        minHeight: 300,
        position: 'relative',
      })}
    >
      <Stack
        sx={{
          position: 'absolute',
          top: 16,
          bottom: 16,
          left: 16,
          right: 16,
        }}
      >
        <Group position="apart">
          <Text color="dimmed">{t('resource.events')}</Text>
          <ActionIcon
            title={t('modal.event.create')}
            size="lg"
            variant="filled"
            color={theme.fn.themeColor(theme.primaryColor)}
            onClick={() => openModal({
              title: t('modal.event.create'),
              children: <CreateEventForm groupId={groupId}/>,
              fullScreen: !xs,
            })}
          >
            <Plus/>
          </ActionIcon>
        </Group>
        <ScrollArea>
          <QueryComponent
            resourceName={t('resource.feed')}
            query={eventsQuery}
            eventInfo={{event: InvalidateEvent.EventGetFeed, id: groupId}}
          >
            <Stack>
              {events.map((event, index) => (
                <Box ref={(index === events.length - 1) ? ref : undefined} key={event.id}>
                  <EventCard event={event}/>
                </Box>
              ))}
              {eventsQuery.isFetching && <CenteredLoader/>}
            </Stack>
          </QueryComponent>
        </ScrollArea>
      </Stack>
    </Card>
  );
};
