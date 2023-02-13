import {Stack, Text} from "@mantine/core";
import {useRouter} from "next/router";
import React from "react";
import {QueryComponent} from "../../components/QueryComponent";
import {api} from "../../utils/api";

export default function UserDetailsPage() {
  const {query: {id}} = useRouter();

  const userDetailsQuery = api.user.getById.useQuery(`${id}`);

  return (
    <QueryComponent resourceName={"User Details"} query={userDetailsQuery}>
      {userDetailsQuery.data && (
        <Stack>
          <Text weight="bold" size="xl">
            {userDetailsQuery.data.name}
          </Text>
          <Text>{userDetailsQuery.data.introduction}</Text>
          {/*{userDetailsQuery.data.createdEvents && TODO zod circular reference
            userDetailsQuery.data.createdEvents.length !== 0 && (
              <>
                <Text size="lg">Owned Events</Text>
                <SimpleGrid cols={3}>
                  {userDetailsQuery.data.createdEvents?.map((event: EventType) => (
                    <EventCard event={event} key={event.id}/>
                  ))}
                </SimpleGrid>
              </>
            )}*/}
        </Stack>
      )}
    </QueryComponent>
  );
}
