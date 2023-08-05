import {Box, Card, LoadingOverlay} from '@mantine/core';
import {UseTRPCQueryResult} from '@trpc/react-query/shared';
import {useTranslation} from 'next-i18next';
import {FunctionComponent, useEffect} from 'react';
import {CenteredLoader} from './CenteredLoader';
import {EventInfo, usePusher} from '../hooks/usePusher';

// TODO generic component: query.data has to match setState arg
// TODO consider passing in a function to render children -> .data won't be undefined there
export const QueryComponent: FunctionComponent<{
  resourceName: string;
  query: UseTRPCQueryResult<unknown, unknown>;
  children: JSX.Element | JSX.Element[] | string | undefined | null;
  setState?: (newState: unknown) => void;
  eventInfo?: EventInfo;
  updating?: boolean; // TODO pass this in from mutations
}> = ({resourceName, query, children, setState, eventInfo, updating}) => {
  const {t} = useTranslation('common');

  useEffect(() => {
    if (setState && query.data) {
      setState(query.data);
    }
  }, [query.data, setState]);

  usePusher(eventInfo, () => void query.refetch());

  return (
    <>
      {query.error ? (
        <Card withBorder>{t('queryComponent.error', {resourceName})}</Card>
      ) : query.isLoading ? (
        <CenteredLoader/> // TODO skeleton instead of this
      ) : (
        <Box sx={{position: 'relative', height: '100%'}}>
          <LoadingOverlay visible={Boolean(updating)}
                          sx={theme => ({borderRadius: theme.fn.radius(theme.defaultRadius)})}/>
          {children}
        </Box>
      )}
    </>
  );
};
