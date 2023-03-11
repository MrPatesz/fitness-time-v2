import {Group, Stack, Text} from "@mantine/core";
import {useRouter} from "next/router";
import {EventGrid} from "../../components/event/EventGrid";
import {QueryComponent} from "../../components/QueryComponent";
import UserImage from "../../components/user/UserImage";
import {api} from "../../utils/api";

export default function UserDetailsPage() {
  const {query: {id}, isReady} = useRouter();

  const userDetailsQuery = api.user.getById.useQuery(id as string, {
    enabled: isReady,
  });

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
          {!!userDetailsQuery.data.createdEvents.length && (
            <>
              <Text size="lg">Owned Events</Text>
              <EventGrid events={userDetailsQuery.data.createdEvents}/>
            </>
          )}
        </Stack>
      )}
    </QueryComponent>
  );
}
