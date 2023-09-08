import {GoogleMap, GoogleMapProps, MarkerF} from '@react-google-maps/api';
import {FunctionComponent} from 'react';
import {LocationType} from '../../models/Location';
import {Center, Loader} from '@mantine/core';
import {useTranslation} from 'next-i18next';
import {useGoogleMaps} from '../../hooks/useGoogleMaps';

export const Map: FunctionComponent<
  GoogleMapProps & { markerLocations: LocationType[] }
> = ({markerLocations, ...mapProps}) => {
  const {t} = useTranslation('common');
  const {loading, error} = useGoogleMaps();

  return (
    <Center h="100%">
      {error ? (
        t('mapComponent.error')
      ) : loading ? (
        <Loader/>
      ) : (
        <GoogleMap {...mapProps}>
          {markerLocations.map(location => (
            <MarkerF
              key={location.id}
              title={location.address}
              position={{
                lat: location.latitude,
                lng: location.longitude,
              }}
            />
          ))}
        </GoogleMap>
      )}
    </Center>
  );
};
