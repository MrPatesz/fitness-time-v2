import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import i18nConfig from '../../next-i18next.config.mjs';
import {api} from '../utils/api';
import {Anchor, Card, Stack, Text, useMantineTheme} from '@mantine/core';
import {Map} from '../components/location/Map';
import {FunctionComponent, useMemo} from 'react';
import {CircleF, MarkerF} from '@react-google-maps/api';
import {useShortDateFormatter} from '../utils/formatters';
import {useDebouncedValue, useLocalStorage, useMediaQuery} from '@mantine/hooks';
import {usePusher} from '../hooks/usePusher';
import {InvalidateEvent} from '../utils/enums';
import {useMyRouter} from '../hooks/useMyRouter';
import {CoordinatesType} from '../models/Location';
import {useGeolocation} from '../hooks/useGeolocation';
import {CenteredLoader} from '../components/CenteredLoader';
import Link from 'next/link';
import {useTranslation} from 'next-i18next';

const MapWithEvents: FunctionComponent<{
  center: CoordinatesType;
}> = ({center}) => {
  const theme = useMantineTheme();
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
  const md = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
  const {locale, pushRoute} = useMyRouter();
  const shortDateFormatter = useShortDateFormatter();

  const [zoom, setZoom] = useLocalStorage({
    key: 'google-map-zoom',
    defaultValue: 12,
  });
  const maxDistance = useMemo(() => {
    const increment = md ? 0 : xs ? 0.5 : 1;
    return 40000 / Math.pow(2, zoom + increment);
  }, [zoom, xs, md]);
  const [debouncedMaxDistance] = useDebouncedValue(maxDistance, 500);

  const eventsQuery = api.event.getMap.useQuery({center, maxDistance: debouncedMaxDistance});
  usePusher({event: InvalidateEvent.EventGetMap}, () => void eventsQuery.refetch());

  return (
    <Stack h="100%">
      <Map
        zoom={zoom}
        onZoom={setZoom}
        mapContainerStyle={{width: '100%', height: '100%'}}
        center={{
          lat: center.latitude,
          lng: center.longitude,
        }}
      >
        <CircleF
          radius={maxDistance * 1000}
          center={{lat: center.latitude, lng: center.longitude}}
          options={{
            fillColor: theme.fn.themeColor(theme.primaryColor),
            strokeColor: theme.fn.themeColor(theme.primaryColor),
          }}
        />
        <CircleF
          radius={maxDistance * 10}
          center={{lat: center.latitude, lng: center.longitude}}
        />
        {eventsQuery.data?.map(event => (
          <MarkerF
            key={event.id}
            title={`${event.name}\n${event.creator.name}\n${shortDateFormatter.format(event.start)}\n${event.description}`}
            position={{lat: event.location.latitude, lng: event.location.longitude}}
            onClick={() => void pushRoute(`/events/${event.id}`, undefined, {locale})}
          />
        ))}
      </Map>
    </Stack>
  );
};

export default function MapPage() {
  const {locale} = useMyRouter();
  const {t} = useTranslation('common');

  const {loading, location, hasLocation} = useGeolocation();

  return (
    <>
      {loading ? (
        <CenteredLoader/>
      ) : hasLocation ? (
        <MapWithEvents center={location}/>
      ) : (
        <Card withBorder>
          <Text>
            {t('mapPage.absentPermission1')}&nbsp;
            <Link href={`/profile`} locale={locale} passHref>
              <Anchor>{t('resource.profile')}</Anchor>
            </Link>
            {t('mapPage.absentPermission2')}
          </Text>
        </Card>
      )}
    </>
  );
}

export const getServerSideProps = async ({locale}: {
  locale: string
}) => ({
  props: {...(await serverSideTranslations(locale, ['common'], i18nConfig))},
});
