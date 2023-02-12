import {FunctionComponent, useState} from "react";
import {Autocomplete, useJsApiLoader} from "@react-google-maps/api";
import {Card, Loader, TextInput} from "@mantine/core";
import {env} from "../env.mjs";
import {LocationType} from "../models/Location";

export const googleMapsLibraries: (
  | "places"
  | "drawing"
  | "geometry"
  | "localContext"
  | "visualization"
  )[] = ["places"];

export const LocationPicker: FunctionComponent<{
  defaultLocation: string;
  setLocation: (location: LocationType) => void;
}> = ({defaultLocation, setLocation}) => {
  const {isLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey: `${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
    libraries: googleMapsLibraries,
  });

  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);

  return (
    <>
      {loadError ? (
        <Card withBorder>An error occurred while loading places!</Card>
      ) : isLoaded ? (
        <Autocomplete
          onLoad={(ac) => setAutocomplete(ac)}
          onPlaceChanged={() => {
            const place = autocomplete?.getPlace();
            const location = place?.geometry?.location;

            if (location) {
              setLocation({
                longitude: location.lng(),
                latitude: location.lat(),
                address: `${place.formatted_address}`,
              });
            }
          }}
        >
          <TextInput
            withAsterisk
            label="Location"
            placeholder="Where will it take place?"
            defaultValue={defaultLocation}
          />
        </Autocomplete>
      ) : (
        <Loader/>
      )}
    </>
  );
};
