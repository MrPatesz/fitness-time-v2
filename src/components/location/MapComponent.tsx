import {Card, Center, Loader, Stack, Text} from '@mantine/core';
import {GoogleMap, MarkerF, useJsApiLoader} from '@react-google-maps/api';
import {useTranslation} from 'next-i18next';
import {FunctionComponent, useMemo} from 'react';
import {env} from '../../env.mjs';
import {LocationType} from '../../models/Location';
import {googleMapsLibraries} from '../../utils/defaultObjects';
import {formatDistance} from '../../utils/utilFunctions';

const MapComponent: FunctionComponent<{
  location: LocationType;
  size?: { width: number, height: number }
  distance: number | undefined;
}> = ({distance, location, size = {width: 400, height: 400}}) => {
  const {t} = useTranslation('common');
  const {isLoaded, loadError: mockLoadError} = useJsApiLoader({
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: googleMapsLibraries,
  });
  const loadError = mockLoadError || env.NEXT_PUBLIC_VERCEL_ENV === 'development';

  const map = useMemo(() => {
    const coordinates = {
      lat: location.latitude,
      lng: location.longitude,
    };
    return (
      <GoogleMap
        zoom={17}
        center={coordinates}
        mapContainerStyle={size}
      >
        <MarkerF title={location.address} position={coordinates}/>
      </GoogleMap>
    );
  }, [location, isLoaded, loadError]);

  return (
    <Card withBorder p={0} sx={{...size, position: 'relative'}}>
      <Card
        withBorder
        p={8}
        sx={{
          position: 'absolute',
          bottom: 9,
          left: 9,
          right: loadError ? 9 : 59,
          zIndex: 1,
        }}
      >
        <Stack spacing={0}>
          <Text>{location.address}</Text>
          {distance !== undefined && (<Text>{formatDistance(distance)}</Text>)}
        </Stack>
      </Card>
      <Center sx={{height: '100%', width: '100%'}}>
        {loadError ? t('mapComponent.error') : !isLoaded ? <Loader/> : map}
      </Center>
    </Card>
  );
};

export default MapComponent;
