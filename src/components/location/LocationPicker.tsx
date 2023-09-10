import {ActionIcon, Card, Group, Stack, Text, TextInput} from '@mantine/core';
import {Autocomplete} from '@react-google-maps/api';
import {useTranslation} from 'next-i18next';
import {FunctionComponent, useEffect, useState} from 'react';
import {X} from 'tabler-icons-react';
import {CreateLocationType} from '../../models/Location';
import {CenteredLoader} from '../CenteredLoader';
import {useGoogleMaps} from '../../hooks/useGoogleMaps';

export const LocationPicker: FunctionComponent<{
  label: string;
  location: CreateLocationType | null;
  setLocation: (location: CreateLocationType | null) => void;
  placeholder?: string;
  description?: string;
  required?: boolean;
  error?: string | undefined;
}> = ({location, setLocation, error, required = false, placeholder, description, label}) => {
  const {loading, error: mapsError} = useGoogleMaps();
  const {t} = useTranslation('common');

  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [address, setAddress] = useState(location?.address ?? '');

  useEffect(() => {
    setAddress(location?.address ?? '');
  }, [location]);

  return (
    <>
      {mapsError ? (
        <Card withBorder>{t('locationPicker.error')}</Card>
      ) : loading ? (
        <Stack spacing={2} mt={2} mb={-1}>
          <Group spacing={4}>
            <Text weight={500} size="sm">{label}</Text>
            <Text weight={500} size="sm" color="red">*</Text>
          </Group>
          <Card withBorder p={'sm'}>
            <CenteredLoader/>
          </Card>
        </Stack>
      ) : (
        <Autocomplete
          onLoad={setAutocomplete}
          onPlaceChanged={() => {
            const place = autocomplete?.getPlace();
            const location = place?.geometry?.location;

            if (location) {
              setLocation({
                longitude: location.lng(),
                latitude: location.lat(),
                address: place.formatted_address ?? '',
              });
            } else {
              setLocation(null);
            }
          }}
        >
          <TextInput
            withAsterisk={required}
            label={label}
            placeholder={placeholder}
            description={description}
            value={address}
            onChange={event => setAddress(event.currentTarget.value)}
            error={error}
            onBlur={event => {
              if (event.currentTarget.value) {
                setAddress(location?.address ?? '');
              } else {
                setLocation(null);
              }
            }}
            rightSection={
              <ActionIcon
                title={t('locationPicker.remove')}
                disabled={!location}
                variant="transparent"
                onClick={() => setLocation(null)}
              >
                <X/>
              </ActionIcon>
            }
          />
        </Autocomplete>
      )}
    </>
  );
};
