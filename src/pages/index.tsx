import {Checkbox, Group, Slider, Stack, Text, useMantineTheme} from '@mantine/core';
import {useIntersection, useLocalStorage} from '@mantine/hooks';
import {useSession} from 'next-auth/react';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import {useEffect, useMemo} from 'react';
import i18nConfig from '../../next-i18next.config.mjs';
import {CenteredLoader} from '../components/CenteredLoader';
import {EventGrid} from '../components/event/EventGrid';
import {BasicEventType} from '../models/Event';
import {api} from '../utils/api';
import {formatDistance} from '../utils/utilFunctions';
import {QueryComponent} from '../components/QueryComponent';
import {InvalidateEvent} from '../utils/enums';

import {BorderComponent} from '../components/BorderComponent';

export default function FeedPage() {
  const [fluidMaxDistance, setFluidMaxDistance] = useLocalStorage<number>({
    key: 'fluid-max-distance',
    defaultValue: 40,
  });
  const [maxDistance, setMaxDistance] = useLocalStorage<number>({
    key: 'max-distance',
    defaultValue: 40,
  });
  const [enableMaxDistance, setEnableMaxDistance] = useLocalStorage<boolean>({
    key: 'enable-max-distance',
    defaultValue: false,
  });

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
        <BorderComponent>
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
        </BorderComponent>
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
