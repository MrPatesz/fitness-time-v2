import React from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { Card, Loader } from "@mantine/core";
import { googleMapsLibraries } from "./LocationPicker";
import { Location } from "../models/Location";
import {env} from "../env.mjs";

const MapComponent: React.FunctionComponent<{
  locationDto: Location;
}> = ({ locationDto }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: `${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
    libraries: googleMapsLibraries,
  });

  const location = {
    lat: locationDto.latitude,
    lng: locationDto.longitude,
  };

  return (
    <>
      {loadError ? (
        <Card withBorder>An error occurred while loading map!</Card>
      ) : isLoaded ? (
        <GoogleMap
          mapContainerStyle={{
            width: "400px",
            height: "400px",
          }}
          center={location}
          zoom={17}
        >
          <MarkerF title={locationDto.address} position={location} />
        </GoogleMap>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default React.memo(MapComponent);
