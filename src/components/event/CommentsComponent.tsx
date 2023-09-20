import {useRouter} from 'next/router';
import {api} from '../../utils/api';
import {QueryComponent} from '../QueryComponent';
import {Card, ScrollArea, Stack} from '@mantine/core';
import {getBackgroundColor} from '../../utils/utilFunctions';
import {AddComment} from '../comment/AddComment';
import {CommentCard} from '../comment/CommentCard';
import {useTranslation} from 'next-i18next';
import {InvalidateEvent} from '../../utils/enums';

export const CommentsComponent = () => {
  const {query: {id}, isReady} = useRouter();
  const {t} = useTranslation('common');

  const eventId = parseInt(id as string);
  const commentsQuery = api.comment.getAllByEventId.useQuery(eventId, {
    enabled: isReady,
    refetchOnMount: false,
  });

  return (
    <QueryComponent
      resourceName={t('resource.comments')}
      query={commentsQuery}
      eventInfo={{event: InvalidateEvent.CommentGetAllByEventId, id: eventId}}
    >
      <Card
        withBorder
        sx={theme => ({backgroundColor: getBackgroundColor(theme)})}
      >
        <Stack>
          <AddComment eventId={eventId}/>
          {!!commentsQuery.data?.length && (
            <ScrollArea>
              <Stack sx={{maxHeight: 300}}>
                {commentsQuery.data.map(comment => (
                  <CommentCard key={comment.id} comment={comment}/>
                ))}
              </Stack>
            </ScrollArea>
          )}
        </Stack>
      </Card>
    </QueryComponent>
  );
};
