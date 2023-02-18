import {Badge, Button, Card, Group, Stack, Text} from "@mantine/core";
import Link from "next/link";
import {FunctionComponent} from "react";
import {BasicEventType} from "../../models/Event";

export const EventCard: FunctionComponent<{
  event: BasicEventType;
}> = ({event}) => {
  return (
    <Card withBorder shadow="md" p="lg">
      <Stack spacing="xs">
        <Group position="apart">
          <Text weight="bold">{event.name}</Text>
          <Badge>{new Date(event.start).toLocaleDateString()}</Badge>
        </Group>
        <Group>
          {!event.price && (
            <Badge color="green" variant="light">
              Free
            </Badge>
          )}
          {event.equipment && (
            <Badge color="yellow" variant="light">
              Equipment
            </Badge>
          )}
          {event.limit && (
            <Badge color="red" variant="light">
              Limited
            </Badge>
          )}
          {/* {event.recurring && (
            <Badge color="violet" variant="light">
              Recurring
            </Badge>
          )} */}
        </Group>
        <Text>{event.description}</Text>
        <Link href={"/events/[id]"} as={`/events/${event.id}`} passHref>
          <Button>Details</Button>
        </Link>
      </Stack>
    </Card>
  );
};
