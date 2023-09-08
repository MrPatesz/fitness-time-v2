import {useJsApiLoader} from '@react-google-maps/api';
import {env} from '../env.mjs';

const googleMapsLibraries: (
  | 'places'
  | 'drawing'
  | 'geometry'
  | 'localContext'
  | 'visualization'
  )[] = ['places'];

export const useGoogleMaps = () => {
  const {isLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: googleMapsLibraries,
  });

  const loading = !isLoaded;
  const error = Boolean(loadError);

  return {loading, error};
};
