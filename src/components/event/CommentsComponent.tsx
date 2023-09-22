import {api} from '../../utils/api';
import {QueryComponent} from '../QueryComponent';
import {Card, ScrollArea, Stack} from '@mantine/core';
import {getBackgroundColor} from '../../utils/utilFunctions';
import {AddComment} from '../comment/AddComment';
import {CommentCard} from '../comment/CommentCard';
import {useTranslation} from 'next-i18next';
import {InvalidateEvent} from '../../utils/enums';
import {usePathId} from '../../hooks/usePathId';
import {CenteredLoader} from '../CenteredLoader';

export const CommentsComponent = () => {
  const {id: eventId, isReady} = usePathId<number>();
  const {t} = useTranslation('common');

  const commentsQuery = api.comment.getAllByEventId.useQuery(eventId!, {
    enabled: isReady,
    refetchOnMount: false,
  });

  return !isReady ? (
    <CenteredLoader/>
  ) : (
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
