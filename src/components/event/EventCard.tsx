import {Badge, Card, Group, Stack, Text} from "@mantine/core";
import {useTranslation} from "next-i18next";
import Link from "next/link";
import {useRouter} from "next/router";
import {FunctionComponent} from "react";
import {BasicEventType} from "../../models/Event";
import {shortDateFormatter} from "../../utils/formatters";
import {getBackgroundColor} from "../../utils/utilFunctions";
import {ThemeColor} from "../user/ThemeColorPicker";

export const EventCard: FunctionComponent<{
  event: BasicEventType;
}> = ({event}) => {
  const {locale} = useRouter();
  const {t} = useTranslation("common");

  return (
    <Link href={`/events/${event.id}`} locale={locale} passHref>
      <Card
        withBorder
        sx={theme => ({
          height: "100%",
          ":hover": {
            backgroundColor: getBackgroundColor(theme),
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
                  {t("common.free")}
                </Badge>
              )}
              {event.equipment && (
                <Badge color="yellow" variant="light">
                  {t("myEvents.equipment")}
                </Badge>
              )}
              {event.limit && (
                <Badge color="red" variant="light">
                  {t("filterEvents.limited")}
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
            <Link href={`/users/${event.creator.id}`} locale={locale} passHref>
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
