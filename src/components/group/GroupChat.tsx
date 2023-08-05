import {Box, Card, ScrollArea, Stack} from '@mantine/core';
import {useIntersection} from '@mantine/hooks';
import {useTranslation} from 'next-i18next';
import {FunctionComponent, useEffect, useMemo, useRef} from 'react';
import {api} from '../../utils/api';
import {getBackgroundColor} from '../../utils/utilFunctions';
import {CommentCard} from '../comment/CommentCard';
import {AddMessage} from './AddMessage';
import {CenteredLoader} from '../CenteredLoader';
import {QueryComponent} from '../QueryComponent';
import {InvalidateEvent} from '../../utils/enums';

export const GroupChat: FunctionComponent<{
  groupId: number;
}> = ({groupId}) => {
  const viewport = useRef<HTMLDivElement>(null);
  const {t} = useTranslation('common');
  const {ref, entry} = useIntersection({threshold: 0.1});

  const messagesQuery = api.groupChat.getMessages.useInfiniteQuery({groupId}, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    // onSuccess: () => scrollToBottom(true), // TODO on new message
  });

  const scrollToBottom = (smooth = false) => viewport.current?.scrollTo({
    top: viewport.current?.scrollHeight,
    behavior: smooth ? 'smooth' : undefined,
  });

  const messages = useMemo(() => {
    if (!messagesQuery.data) return [];

    return [...messagesQuery.data.pages]
      .reverse()
      .flatMap(page => page.messages);
  }, [messagesQuery.data?.pages]);

  useEffect(() => {
    scrollToBottom();
  }, [viewport.current, messagesQuery.isLoading]);

  // TODO refactor this
  useEffect(() => {
    if (entry?.isIntersecting && messagesQuery.hasNextPage && !messagesQuery.isFetching) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      messagesQuery.fetchNextPage().then(() => {
        setTimeout(() => {
          const numberOfPages = messagesQuery.data?.pages.length ?? 1;
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
        height: '100%',
        minHeight: 300,
        position: 'relative',
      })}
    >
      <Stack
        justify="end"
        sx={{
          position: 'absolute',
          top: 16,
          bottom: 16,
          left: 16,
          right: 16,
        }}
      >
        <ScrollArea viewportRef={viewport}>
          <Box ref={ref}>
            {messagesQuery.isFetching && <CenteredLoader/>}
          </Box>
          <QueryComponent
            resourceName={t('resource.chat')}
            query={messagesQuery}
            eventInfo={{event: InvalidateEvent.GroupChatGetMessages, id: groupId}}
          >
            <Stack>
              {messages.map((message) => (
                <CommentCard key={message.id} comment={message}/>
              ))}
            </Stack>
          </QueryComponent>
        </ScrollArea>
        <AddMessage groupId={groupId}/>
      </Stack>
    </Card>
  );
};
