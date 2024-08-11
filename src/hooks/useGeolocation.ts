import { useEffect, useState } from 'react';
import { CoordinatesSchema, CoordinatesType } from '../models/Location';
import { api } from '../utils/api';
import { when } from 'typesafe-react';

export const useGeolocation = (enableGeolocation = true) => {
  const [geolocation, setGeolocation] = useState<CoordinatesType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const profileQuery = api.user.profile.useQuery();

  useEffect(() => {
    if (!enableGeolocation) return;

    const onSettled = () => setIsLoading(false);

    void (async () => {
      try {
        const result = await window.navigator.permissions.query({
          name: 'geolocation',
        });

        const onGranted = () => {
          const onSuccess: PositionCallback = ({ coords: { longitude, latitude } }) => {
            setGeolocation({
              longitude,
              latitude,
            });
            onSettled();
          };
          window.navigator.geolocation.getCurrentPosition(onSuccess, onSettled);
        };

        when(result.state, {
          granted: onGranted,
          prompt: onGranted,
          denied: onSettled,
        });
      } catch (_) {
        onSettled();
      }
    })();
  }, [enableGeolocation]);

  const result = CoordinatesSchema.safeParse(geolocation ?? profileQuery.data?.location);
  const loading = isLoading || profileQuery.isLoading; // TODO isFetching?

  if (result.success) {
    return { loading: false, location: result.data };
  } else if (loading) {
    return { loading };
  } else {
    return { loading, error: true };
  }
};
