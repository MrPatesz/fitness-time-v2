import {Box, Checkbox, Flex, Group, SimpleGrid, Slider, Stack, Text, useMantineTheme} from '@mantine/core';
import {useDebouncedValue, useIntersection, useLocalStorage, useMediaQuery} from '@mantine/hooks';
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
  const [includeArchive, setIncludeArchive] = useLocalStorage<boolean>({
    key: 'include-archive',
    defaultValue: true,
  });
  const [myGroupsOnly, setMyGroupsOnly] = useLocalStorage<boolean>({
    key: 'my-groups-only',
    defaultValue: false,
  });
  const [enableMaxDistance, setEnableMaxDistance] = useLocalStorage<boolean>({
    key: 'enable-max-distance',
    defaultValue: false,
  });
  const [maxDistance, setMaxDistance] = useLocalStorage<number>({
    key: 'fluid-max-distance',
    defaultValue: 40,
  });
  const [debouncedMaxDistance] = useDebouncedValue(maxDistance, 500);

  const theme = useMantineTheme();
  const md = useMediaQuery(`(min-width: ${theme.breakpoints.md}px)`);
  const {data: session} = useSession();
  const {t} = useTranslation('common');
  const {ref, entry} = useIntersection({threshold: 0.1});

  const feedQuery = api.event.getFeed.useInfiniteQuery({
    maxDistance: session?.user.hasLocation && enableMaxDistance ? debouncedMaxDistance : undefined,
    includeArchive,
    myGroupsOnly,
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const events: BasicEventType[] = useMemo(() => {
    return feedQuery.data?.pages.flatMap(page => page.events) ?? [];
  }, [feedQuery.data?.pages]);

  useEffect(() => {
    if (entry?.isIntersecting && feedQuery.hasNextPage && !feedQuery.isFetching) {
      void feedQuery.fetchNextPage();
    }
  }, [entry]);

  return (
    <Stack>
      <Flex
        gap="xs"
        align="center"
        direction={md ? 'row' : 'column'}
        justify="center"
      >
        {session?.user.hasLocation && (
          <Box w={'100%'} sx={{flexGrow: 1}}>
            <BorderComponent>
              <Stack spacing="xs">
                <Group position="apart">
                  <Group spacing={4}>
                    <Text>{t('feedPage.maxDistance')}</Text>
                    <Text
                      weight="bold"
                      color={enableMaxDistance ? theme.primaryColor : 'dimmed'}
                    >
                      {formatDistance(maxDistance)}
                    </Text>
                  </Group>
                  <Checkbox
                    label={t('feedPage.useMaxDistance')}
                    checked={enableMaxDistance}
                    onChange={e => setEnableMaxDistance(e.currentTarget.checked)}
                  />
                </Group>
                <Slider
                  title={t('feedPage.slider')}
                  step={10}
                  min={10}
                  max={200}
                  label={null}
                  disabled={!enableMaxDistance}
                  value={maxDistance}
                  onChange={setMaxDistance}
                />
              </Stack>
            </BorderComponent>
          </Box>
        )}
        <SimpleGrid cols={(md && session?.user.hasLocation) ? 1 : 2} sx={{minWidth: 155}}>
          <Checkbox
            label={t('feedPage.includeArchive')}
            checked={includeArchive}
            onChange={e => setIncludeArchive(e.currentTarget.checked)}
          />
          <Checkbox
            label={t('feedPage.myGroupsOnly')}
            checked={myGroupsOnly}
            onChange={e => setMyGroupsOnly(e.currentTarget.checked)}
          />
        </SimpleGrid>
      </Flex>
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
