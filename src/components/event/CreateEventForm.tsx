import {closeAllModals} from '@mantine/modals';
import {showNotification} from '@mantine/notifications';
import {useTranslation} from 'next-i18next';
import {FunctionComponent} from 'react';
import {api} from '../../utils/api';
import {getDefaultCreateEvent} from '../../utils/defaultObjects';
import {EventForm} from './EventForm';

export const CreateEventForm: FunctionComponent<{
  groupId?: number;
  initialInterval?: {
    start: Date;
    end: Date;
  };
}> = ({groupId, initialInterval}) => {
  const {t} = useTranslation('common');

  const useCreate = api.event.create.useMutation({
    onSuccess: () => {
      closeAllModals();
      showNotification({
        color: 'green',
        title: t('notification.event.create.title'),
        message: t('notification.event.create.message'),
      });
    },
  });

  return (
    <EventForm
      originalEvent={{...getDefaultCreateEvent(initialInterval), groupId}}
      onSubmit={(data) => useCreate.mutate({...data, price: data.price ?? null, limit: data.limit ?? null})}
    />
  );
};
