import {Card, Checkbox, Group, Slider, Stack, Text, useMantineTheme} from '@mantine/core';
import {useIntersection} from '@mantine/hooks';
import {useSession} from 'next-auth/react';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import {useEffect, useMemo, useState} from 'react';
import i18nConfig from '../../next-i18next.config.mjs';
import {CenteredLoader} from '../components/CenteredLoader';
import {EventGrid} from '../components/event/EventGrid';
import {BasicEventType} from '../models/Event';
import {api} from '../utils/api';
import {formatDistance, getBackgroundColor} from '../utils/utilFunctions';
import {QueryComponent} from '../components/QueryComponent';
import {InvalidateEvent} from '../utils/enums';

export default function FeedPage() {
  const [fluidMaxDistance, setFluidMaxDistance] = useState<number>(100);
  const [maxDistance, setMaxDistance] = useState<number>(100);
  const [enableMaxDistance, setEnableMaxDistance] = useState<boolean>(true);

  const theme = useMantineTheme();
  const {data: session} = useSession();
  const {t} = useTranslation('common');
  const {ref, entry} = useIntersection({threshold: 0.1});

  const feedQuery = api.event.getFeed.useInfiniteQuery({maxDistance: session?.user.hasLocation && enableMaxDistance ? maxDistance : undefined}, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    if (entry?.isIntersecting && feedQuery.hasNextPage && !feedQuery.isFetching) {
      void feedQuery.fetchNextPage();
    }
  }, [entry]);

  const events: BasicEventType[] = useMemo(() => {
    return feedQuery.data?.pages.flatMap(page => page.events) ?? [];
  }, [feedQuery.data?.pages]);

  return (
    <Stack>
      {session?.user.hasLocation && (
        <Card withBorder sx={{backgroundColor: getBackgroundColor(theme)}}>
          <Stack spacing="xs">
            <Group position="apart">
              <Group spacing={4}>
                <Text>{t('feedPage.maxDistance')}</Text>
                <Text
                  weight="bold"
                  color={enableMaxDistance ? theme.primaryColor : 'dimmed'}
                >
                  {formatDistance(fluidMaxDistance)}
                </Text>
              </Group>
              <Checkbox
                label={t('feedPage.useMaxDistance')}
                checked={enableMaxDistance}
                onChange={(e) => setEnableMaxDistance(e.currentTarget.checked)}
              />
            </Group>
            <Slider
              step={10}
              min={10}
              max={200}
              label={null}
              disabled={!enableMaxDistance}
              value={fluidMaxDistance}
              onChange={setFluidMaxDistance}
              onChangeEnd={setMaxDistance}
            />
          </Stack>
        </Card>
      )}
      <QueryComponent
        resourceName={t('resource.feed')}
        query={feedQuery}
        eventInfo={{event: InvalidateEvent.EventGetFeed}}
      >
        <Stack>
          <EventGrid ref={ref} events={events}/>
          {feedQuery.isFetching && <CenteredLoader/>}
        </Stack>
      </QueryComponent>
    </Stack>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ['common'], i18nConfig))},
});
