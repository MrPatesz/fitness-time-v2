import {Badge, Card, Group, Stack, Text} from "@mantine/core";
import Link from "next/link";
import {FunctionComponent} from "react";
import {BasicEventType} from "../../models/Event";
import {shortDateFormatter} from "../../utils/formatters";
import {ThemeColor} from "../user/ThemeColorPicker";

export const EventCard: FunctionComponent<{
  event: BasicEventType;
}> = ({event}) => {
  return (
    <Link href={`/events/${event.id}`}>
      <Card
        withBorder
        sx={theme => ({
          height: "100%",
          ":hover": {
            backgroundColor: theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
          },
        })}
      >
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
          <Group position="right">
            <Link href={`/users/${event.creator.id}`} passHref>
              <Badge
                color={event.creator.themeColor}
                variant="outline"
                sx={theme => ({
                  ":hover": {
                    backgroundColor: theme.fn.themeColor(event.creator.themeColor),
                    color: theme.white,
                  },
                })}
              >
                {event.creator.name}
              </Badge>
            </Link>
          </Group>
        </Stack>
      </Card>
    </Link>
  );
};
