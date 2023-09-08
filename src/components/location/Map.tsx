import {GoogleMap, GoogleMapProps} from '@react-google-maps/api';
import {FunctionComponent} from 'react';
import {Center, Loader} from '@mantine/core';
import {useTranslation} from 'next-i18next';
import {useGoogleMaps} from '../../hooks/useGoogleMaps';

export const Map: FunctionComponent<
  GoogleMapProps
> = (mapProps) => {
  const {t} = useTranslation('common');
  const {loading, error} = useGoogleMaps();

  return (
    <Center h="100%">
      {error ? (
        t('mapComponent.error')
      ) : loading ? (
        <Loader/>
      ) : (
        <GoogleMap {...mapProps}/>
      )}
    </Center>
  );
};
