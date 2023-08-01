import {ActionIcon, Group, useMantineTheme} from '@mantine/core';
import {useForm} from '@mantine/form';
import {showNotification} from '@mantine/notifications';
import {useTranslation} from 'next-i18next';
import {FunctionComponent} from 'react';
import {Send} from 'tabler-icons-react';
import {CreateCommentType} from '../../models/Comment';
import {api} from '../../utils/api';
import {defaultCreateComment} from '../../utils/defaultObjects';
import {RichTextField} from '../rich-text/RichTextField';

export const AddComment: FunctionComponent<{
  eventId: number;
}> = ({eventId}) => {
  const {t} = useTranslation('common');

  const form = useForm<CreateCommentType>({
    initialValues: defaultCreateComment,
  });

  const theme = useMantineTheme();
  const queryContext = api.useContext();
  const createComment = api.comment.create.useMutation({
    onSuccess: () => queryContext.comment.invalidate().then(() =>
      showNotification({
        color: 'green',
        title: t('notification.comment.create.title'),
        message: t('notification.comment.create.message'),
      })
    )
  });

  return (
    <form onSubmit={form.onSubmit((data) => createComment.mutate({createComment: data, eventId}))}>
      <Group>
        <RichTextField
          maxLength={512}
          placeholder={t('commentForm.addComment')}
          formInputProps={form.getInputProps('text')}
        />
        <ActionIcon
          type="submit"
          disabled={!form.isValid() || !form.isDirty()}
          size={36}
          color={theme.primaryColor}
          variant="filled"
        >
          <Send/>
        </ActionIcon>
      </Group>
    </form>
  );
};
