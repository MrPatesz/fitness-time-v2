import {Card, Loader} from "@mantine/core";
import {UseTRPCQueryResult} from "@trpc/react-query/shared";
import React, {useEffect} from "react";

export const QueryComponent: React.FunctionComponent<{
  resourceName: string;
  query: UseTRPCQueryResult<any, any>;
  children: JSX.Element | JSX.Element[] | undefined;
  setState?: (newState: any) => void;
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
      ) : query.data ? (
        children
      ) : (
        query.isFetching && <Loader/>
      )}
    </>
  );
};
