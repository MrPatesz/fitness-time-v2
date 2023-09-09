import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import i18nConfig from '../../next-i18next.config.mjs';
import {api} from '../utils/api';
import {Stack, useMantineTheme} from '@mantine/core';
import {Map} from '../components/location/Map';
import {useEffect, useMemo, useState} from 'react';
import {CreateLocationType} from '../models/Location';
import {LocationPicker} from '../components/location/LocationPicker';
import {CircleF, MarkerF} from '@react-google-maps/api';
import {useRouter} from 'next/router';
import {useShortDateFormatter} from '../utils/formatters';
import {useDebouncedValue, useLocalStorage, useMediaQuery} from '@mantine/hooks';
import {usePusher} from '../hooks/usePusher';
import {InvalidateEvent} from '../utils/enums';

export default function MapPage() {
  const theme = useMantineTheme();
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`);
  const md = useMediaQuery(`(min-width: ${theme.breakpoints.md}px)`);
  const {locale = 'en', push: pushRoute} = useRouter();
  const shortDateFormatter = useShortDateFormatter();

  const [center, setCenter] = useState<CreateLocationType | null>(null);
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

  useEffect(() => {
    if (eventsQuery.data) {
      setCenter(eventsQuery.data.center);
    }
  }, [eventsQuery.data?.center]);

  return (
    <Stack h="100%">
      <LocationPicker
        location={center}
        setLocation={setCenter}
      />
      {center && (
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
          {eventsQuery.data?.events.map(event => (
            <MarkerF
              key={event.id}
              title={`${event.name}\n${event.creator.name}\n${shortDateFormatter.format(event.start)}\n${event.description}`}
              position={{lat: event.location.latitude, lng: event.location.longitude}}
              onClick={() => void pushRoute(`/events/${event.id}`, undefined, {locale})}
            />
          ))}
        </Map>
      )}
    </Stack>
  );
}

export const getServerSideProps = async ({locale}: {
  locale: string
}) => ({
  props: {...(await serverSideTranslations(locale, ['common'], i18nConfig))},
});
