import {Card, Progress} from '@mantine/core';
import {UseTRPCQueryResult} from '@trpc/react-query/shared';
import {useTranslation} from 'next-i18next';
import {FunctionComponent, PropsWithChildren, useEffect} from 'react';
import {CenteredLoader} from './CenteredLoader';
import {EventInfo, usePusher} from '../hooks/usePusher';
import {OverlayLoader} from './OverlayLoader';

// TODO generic component: query.data has to match setState arg
// TODO consider passing in a function to render children -> .data won't be undefined there
export const QueryComponent: FunctionComponent<PropsWithChildren<{
  query: UseTRPCQueryResult<unknown, unknown>;
  resourceName: string;
  setState?: (newState: unknown) => void;
  eventInfo?: EventInfo;
  loading?: boolean;
}>> = ({resourceName, query, children, setState, eventInfo, loading}) => {
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
        <OverlayLoader loading={Boolean(loading)} fillHeight>
          {query.isFetching && (
            <Progress
              animate
              size="xs"
              value={100}
              sx={{position: 'absolute', left: 0, right: 0, zIndex: 3}}
            />
          )}
          {children}
        </OverlayLoader>
      )}
    </>
  );
};
