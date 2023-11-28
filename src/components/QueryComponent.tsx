import {Card, Progress} from '@mantine/core';
import {UseTRPCQueryResult} from '@trpc/react-query/shared';
import {useTranslation} from 'next-i18next';
import {FunctionComponent, PropsWithChildren} from 'react';
import {EventInfo, usePusher} from '../hooks/usePusher';
import {CenteredLoader} from './CenteredLoader';
import {OverlayLoader} from './OverlayLoader';

// TODO consider passing in a function to render children -> .data won't be undefined there, but might be more renders?
export const QueryComponent: FunctionComponent<PropsWithChildren<{
  query: UseTRPCQueryResult<unknown, unknown>;
  resourceName: string;
  eventInfo?: EventInfo;
  loading?: boolean;
}>> = ({children, query, resourceName, eventInfo, loading}) => {
  const {t} = useTranslation('common');

  usePusher(eventInfo, () => void query.refetch());

  return (
    <>
      {query.error ? (
        <Card withBorder>{t('queryComponent.error', {resourceName})}</Card>
      ) : query.isLoading ? (
        <CenteredLoader/> // TODO skeleton instead of this
      ) : (
        // TODO FetchingComponent
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
