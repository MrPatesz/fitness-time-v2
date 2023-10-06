import {
  Anchor,
  Box,
  Checkbox,
  Flex,
  Group,
  HoverCard,
  Overlay,
  SimpleGrid,
  Slider,
  Stack,
  Text,
  useMantineTheme
} from '@mantine/core';
import {useDebouncedValue, useIntersection, useLocalStorage, useMediaQuery} from '@mantine/hooks';
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
import {useGeolocation} from '../hooks/useGeolocation';
import Link from 'next/link';
import {useMyRouter} from '../hooks/useMyRouter';

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

  const {locale} = useMyRouter();
  const theme = useMantineTheme();
  const md = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
  const {t} = useTranslation('common');
  const {ref, entry} = useIntersection({threshold: 0.1});
  const {location, hasLocation} = useGeolocation();

  const feedQuery = api.event.getFeed.useInfiniteQuery({
    includeArchive,
    myGroupsOnly,
    distanceFilter: {
      maxDistance: hasLocation && enableMaxDistance ? debouncedMaxDistance : null,
      location: location ?? null,
    },
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
        <Box sx={{width: '100%', flexGrow: 1, position: 'relative'}}>
          {!hasLocation && (
            <HoverCard width={300} withArrow arrowSize={10} zIndex={401}>
              <HoverCard.Target>
                <Overlay sx={{borderRadius: theme.fn.radius(theme.defaultRadius)}}/>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text size="sm">
                  {t('mapPage.absentPermission1')}&nbsp;
                  <Anchor
                    component={Link}
                    href={`/profile`}
                    locale={locale}
                    passHref
                  >
                    {t('resource.profile')}
                  </Anchor>
                  {t('mapPage.absentPermission2')}
                </Text>
              </HoverCard.Dropdown>
            </HoverCard>
          )}
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
        <SimpleGrid cols={md ? 1 : 2} sx={{minWidth: 155}}>
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
