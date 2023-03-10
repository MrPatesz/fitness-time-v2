import {Badge, Card, Group, Stack, Text} from "@mantine/core";
import Link from "next/link";
import {FunctionComponent} from "react";
import {BasicEventType} from "../../models/Event";
import {shortDateFormatter} from "../../utils/formatters";
import {LinkButton} from "../LinkButton";
import {ThemeColor} from "../user/ThemeColorPicker";
import UserImage from "../user/UserImage";

export const EventCard: FunctionComponent<{
  event: BasicEventType;
}> = ({event}) => {
  return (
    <Card withBorder shadow="md" p="lg">
      <Stack spacing="xs" justify="space-between" sx={{height: "100%"}}>
        <Stack spacing="xs">
          <Group position="apart">
            <Text weight="bold" size="lg">{event.name}</Text>
            <Badge
              color={event.start > new Date() ? ThemeColor.GREEN : ThemeColor.RED}
              variant="dot"
            >
              {shortDateFormatter.format(event.start)}
            </Badge>
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
        </Stack>
        <Group position="apart">
          <LinkButton href={`/events/${event.id}`} label="Details"/>
          <Link href={`/users/${event.creator.id}`} passHref>
            <UserImage user={event.creator} size={36}/>
          </Link>
        </Group>
      </Stack>
    </Card>
  );
};
