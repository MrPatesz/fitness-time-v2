import {Card, Center, LoadingOverlay} from "@mantine/core";
import {GoogleMap, MarkerF, useJsApiLoader} from "@react-google-maps/api";
import React, {FunctionComponent, useMemo} from "react";
import {env} from "../env.mjs";
import {LocationType} from "../models/Location";
import {googleMapsLibraries} from "../utils/defaultObjects";

const MapComponent: FunctionComponent<{
  location: LocationType;
  size?: { width: number, height: number }
}> = ({location, size = {width: 400, height: 400}}) => {
  const {isLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey: `${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
    libraries: googleMapsLibraries,
  });

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
    <>
      {(loadError || true) ? ( // TODO remove true to show map
        <Card withBorder sx={size}>
          <Center sx={{height: "100%", width: "100%"}}>
            An error occurred while loading map!
          </Center>
        </Card>
      ) : !isLoaded ? (
        <Card withBorder sx={{
          ...size,
          position: "relative",
        }}>
          <LoadingOverlay visible={true} sx={theme => ({borderRadius: theme.fn.radius(theme.defaultRadius)})}/>
        </Card>
      ) : map}
    </>
  );
};

export default MapComponent;
