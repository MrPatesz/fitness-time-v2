import {ActionIcon, Group, TextInput, useMantineTheme} from '@mantine/core';
import {useForm} from '@mantine/form';
import {useTranslation} from 'next-i18next';
import {FunctionComponent} from 'react';
import {Send} from 'tabler-icons-react';
import {CreateMessageType} from '../../models/Message';
import {api} from '../../utils/api';
import {defaultCreateComment} from '../../utils/defaultObjects';

export const AddMessage: FunctionComponent<{
  groupId: number;
}> = ({groupId}) => {
  const theme = useMantineTheme();
  const {t} = useTranslation('common');

  const form = useForm<CreateMessageType>({
    initialValues: defaultCreateComment,
  });

  const createMessage = api.groupChat.create.useMutation({
    onSuccess: form.reset,
  });

  return (
    <form onSubmit={form.onSubmit((data) => createMessage.mutate({createMessage: data, groupId}))}>
      <Group>
        <TextInput
          sx={{flexGrow: 1}}
          placeholder={t('messageForm.addMessage')}
          {...form.getInputProps('text')}
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
