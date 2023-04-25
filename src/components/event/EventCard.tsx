import {Badge, Card, Divider, Group, Stack, Text} from "@mantine/core";
import {useTranslation} from "next-i18next";
import Link from "next/link";
import {useRouter} from "next/router";
import {FunctionComponent} from "react";
import {BasicEventType} from "../../models/event/Event";
import {getShortDateFormatter} from "../../utils/formatters";
import {getBackgroundColor} from "../../utils/utilFunctions";
import {EventStatus, ThemeColor} from "../../utils/enums";
import {api} from "../../utils/api";
import {IconStar} from "@tabler/icons";

export const EventCard: FunctionComponent<{
  event: BasicEventType;
}> = ({event}) => {
  const {locale, push: pushRoute} = useRouter();
  const {t} = useTranslation("common");
  const shortDateFormatter = getShortDateFormatter(locale as string);

  const userRatingQuery = api.rating.getAverageRatingForUser.useQuery(event.creatorId);

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
            <Group position="apart" spacing="xs">
              <Text weight="bold" size="lg">{event.name}</Text>
              <Badge
                color={event.status === EventStatus.PLANNED ? ThemeColor.GREEN : ThemeColor.RED}
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
              {event.limit && (
                <Badge color="red" variant="light">
                  {t("filterEvents.limited")}
                </Badge>
              )}
            </Group>
          </Stack>
          <Group position={event.group ? "apart" : "right"} spacing="xs">
            {event.group && (
              <Badge
                color={event.group.creator.themeColor}
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  pushRoute(`/groups/${event.groupId}`, undefined, {locale}).then();
                }}
                sx={theme => ({
                  ":hover": {
                    backgroundColor: theme.fn.themeColor(event.group?.creator.themeColor ?? theme.primaryColor),
                    color: theme.white,
                  },
                })}
              >
                <Text>{event.group.name}</Text>
                {/* TODO groupRating */}
              </Badge>
            )}
            <Badge
              color={event.creator.themeColor}
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                pushRoute(`/users/${event.creatorId}`, undefined, {locale}).then();
              }}
              sx={theme => ({
                ":hover": {
                  backgroundColor: theme.fn.themeColor(event.creator.themeColor),
                  color: theme.white,
                },
              })}
            >
              <Group spacing={8}>
                <Text>{event.creator.name}</Text>
                {userRatingQuery.data?.count && (
                  <>
                    <Divider orientation="vertical" color={event.creator.themeColor}/>
                    <Group spacing={4}>
                      <Text>{userRatingQuery.data.averageStars?.toFixed(1)}</Text>
                      <IconStar size={10}/>
                    </Group>
                  </>
                )}
              </Group>
            </Badge>
          </Group>
        </Stack>
      </Card>
    </Link>
  );
};
