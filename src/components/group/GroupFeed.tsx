import {ActionIcon, Box, Card, Center, Group, Loader, ScrollArea, Stack, useMantineTheme} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {FunctionComponent, useEffect, useMemo, useRef} from "react";
import {useInView} from "react-intersection-observer";
import {api} from "../../utils/api";
import {getBackgroundColor} from "../../utils/utilFunctions";
import {openModal} from "@mantine/modals";
import {EventForm} from "../event/EventForm";
import {Plus} from "tabler-icons-react";
import {EventCard} from "../event/EventCard";
import {BasicEventType} from "../../models/event/Event";

export const GroupFeed: FunctionComponent<{
    groupId: number;
}> = ({groupId}) => {
    const {ref, inView} = useInView();
    const theme = useMantineTheme();
    const viewport = useRef<HTMLDivElement>(null);
    const {t} = useTranslation("common");

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading,
        error,
    } = api.event.getFeed.useInfiniteQuery({groupId}, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage().then();
        }
    }, [inView])

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
                <ScrollArea viewportRef={viewport}>
                    <Stack>
                        {error ? (
                            <Card withBorder>{t("queryComponent.error", {resourceName: t("resource.feed")})}</Card>
                        ) : isLoading ? (
                            <Center sx={{height: "100%", width: "100%"}}>
                                <Loader/>
                            </Center>
                        ) : (
                            events.map((event, index) => (
                                <Box ref={(index === events.length - 1) ? ref : undefined} key={event.id}>
                                    <EventCard event={event}/>
                                </Box>
                            ))
                        )}
                    </Stack>
                </ScrollArea>
            </Stack>
        </Card>
    );
};
