import {Card, Group, Stack, Text, TextInput} from "@mantine/core";
import {Autocomplete, useJsApiLoader} from "@react-google-maps/api";
import {useTranslation} from "next-i18next";
import {FunctionComponent, useEffect, useState} from "react";
import {env} from "../../env.js";
import {CreateLocationType} from "../../models/Location";
import {googleMapsLibraries} from "../../utils/defaultObjects";
import {CenteredLoader} from "../CenteredLoader";

export const LocationPicker: FunctionComponent<{
  initialAddress: string;
  location: CreateLocationType | null;
  setLocation: (location: CreateLocationType | null) => void;
  error?: string | undefined;
  required: boolean;
  placeholder: string;
  description?: string;
}> = ({location, initialAddress, setLocation, error, required, placeholder, description}) => {
  const {t} = useTranslation("common");
  const {isLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey: `${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
    libraries: googleMapsLibraries,
  });

  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [address, setAddress] = useState(initialAddress);

  useEffect(() => {
    if (location) {
      setAddress(location.address);
    }
  }, [location]);

  return (
    <>
      {loadError ? (
        <Card withBorder>{t("locationPicker.error")}</Card>
      ) : !isLoaded ? (
        <Stack spacing={2} mt={2} mb={-1}>
          <Group spacing={4}>
            <Text weight={500} size="sm">{t("common.location")}</Text>
            <Text weight={500} size="sm" color="red">*</Text>
          </Group>
          <Card withBorder p={"sm"}>
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
                address: `${place.formatted_address}`,
              });
            } else {
              setLocation(null);
            }
          }}
        >
          <TextInput
            withAsterisk={required}
            label={t("common.location")}
            placeholder={placeholder}
            description={description}
            value={address}
            onChange={event => setAddress(event.currentTarget.value)}
            error={error}
            onBlur={() => {
              if (!address) {
                setLocation(null);
              }
            }}
          />
        </Autocomplete>
      )}
    </>
  );
};
