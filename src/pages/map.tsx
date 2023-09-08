import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import i18nConfig from '../../next-i18next.config.mjs';
import {api} from '../utils/api';
import {NumberInput, Stack, useMantineTheme} from '@mantine/core';
import {Map} from '../components/location/Map';
import {useEffect, useState} from 'react';
import {CreateLocationType} from '../models/Location';
import {LocationPicker} from '../components/location/LocationPicker';
import {CircleF, MarkerF} from '@react-google-maps/api';


export default function MapPage() {
  const {t} = useTranslation('common');
  const theme = useMantineTheme();

  const [center, setCenter] = useState<CreateLocationType | null>(null);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  // TODO set maxDistance with debounce from map zoom

  const eventsQuery = api.event.getMap.useQuery({center, maxDistance});
  // TODO pusher

  useEffect(() => {
    if (eventsQuery.data) {
      setCenter(eventsQuery.data.center);
    }
  }, [eventsQuery.data?.center]);

  return (
    <Stack h="100%">
      <LocationPicker
        required={false}
        placeholder={t('profileForm.location.placeholder')}
        location={center}
        setLocation={setCenter}
      />
      <NumberInput
        label={t('feedPage.maxDistance')}
        value={maxDistance ?? undefined}
        onChange={newValue => setMaxDistance(newValue ?? null)}
        min={0}
        max={20000}
      />
      {center && (
        <Map
          zoom={maxDistance ? Math.log(40000 / (maxDistance / 5)) : 12}
          mapContainerStyle={{width: '100%', height: '100%'}}
          center={{
            lat: center.latitude,
            lng: center.longitude,
          }}
        >
          {maxDistance && (
            <CircleF
              radius={maxDistance * 1000}
              center={{
                lat: center.latitude,
                lng: center.longitude,
              }}
              options={{
                fillColor: theme.fn.themeColor(theme.primaryColor),
                strokeColor: theme.fn.themeColor(theme.primaryColor),
              }}
              /* TODO editable={true}
                  onCenterChanged={}
                  onRadiusChanged={} */
            />
          )}
          {eventsQuery.data?.events.map(({location}) => (
            <MarkerF
              key={location.id}
              title={location.address}
              position={{
                lat: location.latitude,
                lng: location.longitude,
              }}
              /* TODO onClick
                  more info */
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
