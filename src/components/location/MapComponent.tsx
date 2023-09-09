import {Card, Stack, Text} from '@mantine/core';
import {FunctionComponent} from 'react';
import {LocationType} from '../../models/Location';
import {formatDistance} from '../../utils/utilFunctions';
import {Map} from './Map';
import {MarkerF} from '@react-google-maps/api';

const MapComponent: FunctionComponent<{
  location: LocationType;
  size?: {
    width: number,
    height: number
  }
  distance: number | undefined;
}> = ({distance, location, size = {width: 400, height: 400}}) => {
  return (
    <Card withBorder p={0} sx={{...size, position: 'relative'}}>
      <Card
        withBorder
        p={8}
        sx={{
          position: 'absolute',
          bottom: 9,
          left: 9,
          right: 59,
          zIndex: 1,
        }}
      >
        <Stack spacing={0}>
          <Text>{location.address}</Text>
          {distance !== undefined && (<Text>{formatDistance(distance)}</Text>)}
        </Stack>
      </Card>
      <Map
        zoom={15}
        center={{
          lat: location.latitude,
          lng: location.longitude,
        }}
        mapContainerStyle={size}
      >
        <MarkerF
          title={location.address}
          position={{
            lat: location.latitude,
            lng: location.longitude,
          }}
        />
      </Map>
    </Card>
  );
};

export default MapComponent;
