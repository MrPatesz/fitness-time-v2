import {Group, SimpleGrid, Stack, Text} from "@mantine/core";
import {useRouter} from "next/router";
import {EventCard} from "../../components/event/EventCard";
import {QueryComponent} from "../../components/QueryComponent";
import UserImage from "../../components/user/UserImage";
import {api} from "../../utils/api";

export default function UserDetailsPage() {
  const {query: {id}} = useRouter();

  const userDetailsQuery = api.user.getById.useQuery(`${id}`);

  return (
    <QueryComponent resourceName={"User Details"} query={userDetailsQuery}>
      {userDetailsQuery.data && (
        <Stack>
          <Group position="apart" align="start">
            <Stack>
              <Text weight="bold" size="xl">
                {userDetailsQuery.data.name}
              </Text>
              <Text>{userDetailsQuery.data.introduction}</Text>
            </Stack>
            <UserImage user={userDetailsQuery.data}/>
          </Group>
          {!!userDetailsQuery.data.createdEvents.length && ( // TODO EventGrid component here and on feed page
            <>
              <Text size="lg">Owned Events</Text>
              <SimpleGrid cols={3}>
                {userDetailsQuery.data.createdEvents.map(event => (
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
