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
  });

  return (
    <QueryComponent
      resourceName={t('resource.comments')}
      query={commentsQuery}
      eventInfo={{event: InvalidateEvent.CommentGetAllByEventId, id: eventId}}
    >
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
          sx={{
            position: 'absolute',
            top: 16,
            bottom: 16,
            left: 16,
            right: 16,
          }}
        >
          <AddComment eventId={eventId}/>
          <ScrollArea>
            <Stack>
              {commentsQuery.data?.map(comment => (
                <CommentCard key={comment.id} comment={comment}/>
              ))}
            </Stack>
          </ScrollArea>
        </Stack>
      </Card>
    </QueryComponent>
  );
};
