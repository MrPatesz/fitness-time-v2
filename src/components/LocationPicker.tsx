import {Card, Loader, TextInput} from "@mantine/core";
import {Autocomplete, useJsApiLoader} from "@react-google-maps/api";
import {FunctionComponent, useEffect, useState} from "react";
import {env} from "../env.mjs";
import {CreateLocationType} from "../models/Location";
import {defaultCreateLocation} from "../utils/defaultObjects";

export const googleMapsLibraries: (
  | "places"
  | "drawing"
  | "geometry"
  | "localContext"
  | "visualization"
  )[] = ["places"];

export const LocationPicker: FunctionComponent<{
  initialAddress: string;
  location: CreateLocationType;
  setLocation: (location: CreateLocationType) => void;
  error?: string | undefined;
  required: boolean;
  placeholder: string;
  description?: string;
}> = ({location, initialAddress, setLocation, error, required, placeholder, description}) => {
  const {isLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey: `${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
    libraries: googleMapsLibraries,
  });

  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [address, setAddress] = useState(initialAddress);

  useEffect(() => {
    setAddress(location.address);
  }, [location]);

  return (
    <>
      {loadError ? (
        <Card withBorder>An error occurred while loading places!</Card>
      ) : isLoaded ? (
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
              setLocation(defaultCreateLocation);
            }
          }}
        >
          <TextInput
            withAsterisk={required}
            label="Location"
            placeholder={placeholder}
            description={description}
            value={address}
            onChange={event => setAddress(event.currentTarget.value)}
            error={error}
            onBlur={() => {
              if (!address) {
                setLocation(defaultCreateLocation);
              }
            }}
          />
        </Autocomplete>
      ) : (
        <Loader/>
      )}
    </>
  );
};
