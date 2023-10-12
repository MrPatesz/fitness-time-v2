import {useEffect, useState} from 'react';
import {CoordinatesSchema, CoordinatesType} from '../models/Location';
import {api} from '../utils/api';

export const useGeolocation = (enableGeolocation = true) => {
  const [geolocation, setGeolocation] = useState<CoordinatesType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const profileQuery = api.user.profile.useQuery();

  useEffect(() => {
    if (!enableGeolocation) return;

    const onSettled = () => setIsLoading(false);
    window.navigator.permissions.query({name: 'geolocation'})
      .then((result) => {
          switch (result.state) {
            case 'granted':
            case 'prompt':
              window.navigator.geolocation.getCurrentPosition(
                ({coords: {longitude, latitude}}) => {
                  setGeolocation({
                    longitude,
                    latitude,
                  });
                  onSettled();
                },
                onSettled
              );
              break;
            case 'denied':
              onSettled();
              break;
          }
        }
      )
      .catch(onSettled);
  }, [enableGeolocation]);

  const result = CoordinatesSchema.safeParse(geolocation ?? profileQuery.data?.location);
  const loading = isLoading || profileQuery.isLoading; // TODO isFetching?

  if (result.success) {
    return {loading: false, location: result.data};
  } else if (loading) {
    return {loading};
  } else {
    return {loading, error: true};
  }
};
