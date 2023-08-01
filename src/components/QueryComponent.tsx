import {Box, Card, LoadingOverlay} from '@mantine/core';
import {UseTRPCQueryResult} from '@trpc/react-query/shared';
import {useTranslation} from 'next-i18next';
import {FunctionComponent, useEffect} from 'react';
import {CenteredLoader} from './CenteredLoader';

export const QueryComponent: FunctionComponent<{
  resourceName: string;
  query: UseTRPCQueryResult<any, any>;
  children: JSX.Element | JSX.Element[] | string | undefined | null;
  setState?: (newState: any) => void;
  // TODO placeholder (mock while loading)
}> = ({resourceName, query, children, setState}) => {
  const {t} = useTranslation('common');

  useEffect(() => {
    if (setState && query.data) {
      setState(query.data);
    }
  }, [query.data, setState]);

  return (
    <>
      {query.error ? (
        <Card withBorder>{t('queryComponent.error', {resourceName})}</Card>
      ) : query.isLoading ? (
        <CenteredLoader/>
      ) : query.isFetching ? (
        <Box sx={{position: 'relative', height: '100%'}}>
          <LoadingOverlay visible={true} sx={theme => ({borderRadius: theme.fn.radius(theme.defaultRadius)})}/>
          {children}
        </Box>
      ) : children}
    </>
  );
};
