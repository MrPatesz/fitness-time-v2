import {SimpleGrid, Stack, Text} from "@mantine/core";
import {useRouter} from "next/router";
import React from "react";
import {EventCard} from "../../components/event/EventCard";
import {QueryComponent} from "../../components/QueryComponent";
import {EventType} from "../../models/Event";

export default function UserDetailsPage() {
  return <>User Details Page</>;

  const {query: {id}} = useRouter();

  const userService: any = undefined; // UserService();
  const userDetailsQuery = userService.useGetSingle(id?.toString());

  return (
    <QueryComponent resourceName={"User Details"} query={userDetailsQuery}>
      {userDetailsQuery.data && (
        <Stack>
          <Text weight="bold" size="xl">
            {userDetailsQuery.data.username}
          </Text>
          <Text>{userDetailsQuery.data.introduction}</Text>
          {userDetailsQuery.data.ownedEvents &&
            userDetailsQuery.data.ownedEvents.length !== 0 && (
              <>
                <Text size="lg">Owned Events</Text>
                <SimpleGrid cols={3}>
                  {userDetailsQuery.data.ownedEvents?.map((event: EventType) => (
                    <EventCard event={event} key={event.id}/>
                  ))}
                </SimpleGrid>
              </>
            )}
        </Stack>
      )}
    </QueryComponent>
  );
}
