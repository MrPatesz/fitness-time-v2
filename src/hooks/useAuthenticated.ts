import {useSession, UseSessionOptions} from 'next-auth/react';

export const useAuthenticated = (options?: UseSessionOptions<boolean> | undefined) => {
  const {data: session, status} = useSession(options);

  const loading = status === 'loading';
  const authenticated = status === 'authenticated';

  if (loading) {
    return {loading};
  } else if (!authenticated) {
    return {loading, authenticated};
  } else if (session) {
    return {loading, authenticated, user: session.user};
  }

  throw new Error('Something went wrong!'); // should never happen
};
