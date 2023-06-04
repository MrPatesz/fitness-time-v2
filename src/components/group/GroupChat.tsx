import {Box, Card, Center, Loader, ScrollArea, Stack} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {FunctionComponent, useEffect, useMemo, useRef} from "react";
import {api} from "../../utils/api";
import {getBackgroundColor} from "../../utils/utilFunctions";
import {CommentCard} from "../comment/CommentCard";
import {AddMessage} from "./AddMessage";
import {useIntersection} from "@mantine/hooks";

export const GroupChat: FunctionComponent<{
  groupId: number;
}> = ({groupId}) => {
  const viewport = useRef<HTMLDivElement>(null);
  const {t} = useTranslation("common");
  const lastMessageRef = useRef<HTMLElement>(null);
  const {ref, entry} = useIntersection({
    root: lastMessageRef.current,
    threshold: 1,
  });

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    error,
    refetch: refetchMessages,
  } = api.groupChat.getMessages.useInfiniteQuery({groupId}, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const scrollToBottom = (smooth: boolean = false) => viewport.current?.scrollTo({
    top: viewport.current?.scrollHeight,
    behavior: smooth ? "smooth" : undefined,
  });

  const refetchAndScrollToBottom = () => refetchMessages().then(() => setTimeout(() => scrollToBottom(true), 100));

  api.groupChat.onCreate.useSubscription(groupId, {
    onData: (_message) => {
      refetchAndScrollToBottom();
    },
    onError: (err) => {
      console.error('Subscription error:', err);
      refetchAndScrollToBottom();
    },
  });

  const messages = useMemo(() => {
    if (!data) return [];

    return [...data.pages]
      .reverse()
      .flatMap(page => page.messages);
  }, [data?.pages]);

  useEffect(() => {
    scrollToBottom();
  }, [viewport.current, isLoading]);

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage) {
      fetchNextPage().then(() => {
        setTimeout(() => {
          const numberOfPages = data?.pages.length ?? 1;
          const scrollRatio = 1 - (numberOfPages / (numberOfPages + 1));
          viewport.current?.scrollTo({top: viewport.current?.scrollHeight * scrollRatio});
        }, 100);
      });
    }
  }, [entry]);

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
        justify="end"
        sx={{
          position: "absolute",
          top: 16,
          bottom: 16,
          left: 16,
          right: 16,
        }}
      >
        <ScrollArea viewportRef={viewport}>
          <Center ref={ref} sx={{width: "100%"}}>
            {isFetching && (
              <Box h={25}>
                <Loader/>
              </Box>
            )}
          </Center>
          <Stack>
            {error ? (
              <Card withBorder>
                {t("queryComponent.error", {resourceName: t("resource.chat")})}
              </Card>
            ) : messages.map((message) => (
              <CommentCard key={message.id} comment={message}/>
            ))}
          </Stack>
        </ScrollArea>
        <AddMessage groupId={groupId}/>
      </Stack>
    </Card>
  );
};
