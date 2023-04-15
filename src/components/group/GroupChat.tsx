import {Box, Button, Card, Center, Group, Loader, ScrollArea, Stack, TextInput} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {FunctionComponent, useEffect, useMemo, useRef, useState} from "react";
import {useInView} from "react-intersection-observer";
import {api} from "../../utils/api";
import {getBackgroundColor} from "../../utils/utilFunctions";
import {CommentCard} from "../comment/CommentCard";

export const GroupChat: FunctionComponent<{
  groupId: number;
}> = ({groupId}) => {
  const [messageText, setMessageText] = useState("");

  const {ref, inView} = useInView();
  const viewport = useRef<HTMLDivElement>(null);
  const {t} = useTranslation("common");

  const scrollToBottom = (smooth: boolean = false) => viewport.current?.scrollTo({
    top: viewport.current?.scrollHeight,
    behavior: smooth ? "smooth" : undefined,
  });

  const {
    data: groupChatData,
    fetchNextPage,
    isFetching,
    hasNextPage,
    isLoading,
    error,
    refetch: refetchMessages,
  } = api.groupChat.getMessages.useInfiniteQuery({groupId}, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const useCreateMessage = api.groupChat.create.useMutation({
    onSuccess: () => refetchMessages().then(() => {
      setTimeout(() => scrollToBottom(true), 100);
    }),
  });

  const messages = useMemo(() => {
    if (!groupChatData) return [];

    return [...groupChatData.pages]
      .reverse()
      .flatMap(page => page.messages)
      .map(m => (<CommentCard key={m.id} comment={m}/>));
  }, [groupChatData?.pages]);

  useEffect(() => {
    scrollToBottom();
  }, [viewport.current]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage().then(() => {
        setTimeout(() => {
          const numberOfPages = groupChatData?.pages.length ?? 1;
          const scrollRatio = 1 - numberOfPages / (numberOfPages + 1);
          viewport.current?.scrollTo({top: viewport.current?.scrollHeight * scrollRatio});
        }, 100);
      });
    }
  }, [inView]);

  return (
    <Card
      withBorder
      sx={theme => ({
        backgroundColor: getBackgroundColor(theme),
        height: "100%",
        position: "relative",
        minHeight: 300,
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
            ) : isLoading ? (
              <Center sx={{height: "100%", width: "100%"}}>
                <Loader/>
              </Center>
            ) : (
              messages
            )}
          </Stack>
        </ScrollArea>
        <Group>
          <TextInput
            sx={{flexGrow: 1}}
            value={messageText}
            onChange={event => setMessageText(event.currentTarget.value)}
          />
          <Button
            onClick={() => useCreateMessage.mutateAsync({
              groupId,
              createMessage: {message: messageText}
            }).then(() => setMessageText(""))}
          >
            Post
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};
