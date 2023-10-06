import {useEffect, useState} from 'react';
import {CoordinatesSchema, CoordinatesType} from '../models/Location';
import {api} from '../utils/api';

export const useGeolocation = () => {
  const [geolocation, setGeolocation] = useState<CoordinatesType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const profileQuery = api.user.profile.useQuery();

  useEffect(() => {
    window.navigator.geolocation.getCurrentPosition(
      ({coords: {longitude, latitude}}) => {
        setGeolocation({
          longitude,
          latitude,
        });
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      },
    );
  }, []);

  const result = CoordinatesSchema.safeParse(geolocation ?? profileQuery.data?.location);
  const hasLocation = result.success;
  const loading = !hasLocation && (isLoading || profileQuery.isLoading);

  if (loading) {
    return {loading};
  } else if (!hasLocation) {
    return {loading, hasLocation};
  } else {
    return {loading, hasLocation, location: result.data};
  }
};
