import {ActionIcon, Box, Card, Group, ScrollArea, Stack, useMantineTheme} from "@mantine/core";
import {useIntersection} from "@mantine/hooks";
import {openModal} from "@mantine/modals";
import {useTranslation} from "next-i18next";
import {FunctionComponent, useEffect, useMemo, useRef} from "react";
import {Plus} from "tabler-icons-react";
import {BasicEventType} from "../../models/event/Event";
import {api} from "../../utils/api";
import {getBackgroundColor} from "../../utils/utilFunctions";
import {CenteredLoader} from "../CenteredLoader";
import {EventCard} from "../event/EventCard";
import {EventForm} from "../event/EventForm";

export const GroupFeed: FunctionComponent<{
  groupId: number;
}> = ({groupId}) => {
  const theme = useMantineTheme();
  const {t} = useTranslation("common");
  const lastEventRef = useRef<HTMLElement>(null);
  const {ref, entry} = useIntersection({
    root: lastEventRef.current,
    threshold: 1,
  });

  const {
    data,
    isFetching,
    fetchNextPage,
    hasNextPage,
    error,
  } = api.event.getFeed.useInfiniteQuery({groupId}, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage) {
      fetchNextPage();
    }
  }, [entry]);

  const events: BasicEventType[] = useMemo(() => {
    return data?.pages.flatMap(page => page.events) ?? [];
  }, [data?.pages])

  return (
    <Card
      withBorder
      sx={theme => ({
        backgroundColor: getBackgroundColor(theme),
        height: "100%",
        minHeight: 300,
        position: "relative",
      })}
    >
      <Stack
        sx={{
          position: "absolute",
          top: 16,
          bottom: 16,
          left: 16,
          right: 16,
        }}
      >
        <Group position="right">
          <ActionIcon
            size="lg"
            variant="filled"
            color={theme.fn.themeColor(theme.primaryColor)}
            onClick={() => openModal({
              title: t("modal.event.create"),
              children: <EventForm groupId={groupId}/>,
            })}
          >
            <Plus/>
          </ActionIcon>
        </Group>
        <ScrollArea>
          <Stack>
            {error ? (
              <Card withBorder>{t("queryComponent.error", {resourceName: t("resource.feed")})}</Card>
            ) : events.map((event, index) => (
              <Box ref={(index === events.length - 1) ? ref : undefined} key={event.id}>
                <EventCard event={event}/>
              </Box>
            ))}
            {isFetching && <CenteredLoader/>}
          </Stack>
        </ScrollArea>
      </Stack>
    </Card>
  );
};
