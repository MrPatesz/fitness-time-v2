import {Box, Card, Loader, LoadingOverlay} from "@mantine/core";
import {UseTRPCQueryResult} from "@trpc/react-query/shared";
import React, {FunctionComponent, useEffect} from "react";

export const QueryComponent: FunctionComponent<{
  resourceName: string;
  query: UseTRPCQueryResult<any, any>;
  children: JSX.Element | JSX.Element[] | string | undefined | null;
  setState?: (newState: any) => void;
  // TODO placeholder (mock while loading)
}> = ({resourceName, query, children, setState}) => {
  useEffect(() => {
    if (setState && query.data) {
      setState(query.data);
    }
  }, [query.data, setState]);

  return (
    <>
      {query.error ? (
        <Card withBorder>An error occurred while fetching {resourceName}!</Card>
      ) : query.isLoading ? (
        <Loader/>
      ) : query.isFetching ? (
        <Box sx={{position: "relative"}}>
          <LoadingOverlay visible={true} sx={theme => ({borderRadius: theme.fn.radius(theme.defaultRadius)})}/>
          {children}
        </Box>
      ) : children}
    </>
  );
};
