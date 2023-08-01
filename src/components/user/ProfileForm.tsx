import {Button, Group, Stack, TextInput, Title} from '@mantine/core';
import {useForm} from '@mantine/form';
import {showNotification} from '@mantine/notifications';
import {useTranslation} from 'next-i18next';
import {FunctionComponent} from 'react';
import {ProfileType, UpdateProfileType} from '../../models/User';
import {api} from '../../utils/api';
import {isValidUrl, refreshSession} from '../../utils/utilFunctions';
import {LocationPicker} from '../location/LocationPicker';
import {RichTextField} from '../rich-text/RichTextField';
import {ThemeColorPicker} from './ThemeColorPicker';
import UserImage from './UserImage';
import {ThemeColor} from '../../utils/enums';
import {getFormLocationOnChange, getFormLocationValue} from '../../utils/mantineFormUtils';

export const ProfileForm: FunctionComponent<{
  user: ProfileType;
}> = ({user}) => {
  const {t} = useTranslation('common');

  const queryContext = api.useContext();
  const useUpdate = api.user.update.useMutation({
    onSuccess: () => queryContext.user.invalidate().then(() => {
      refreshSession();
      showNotification({
        color: 'green',
        title: t('notification.profile.update.title'),
        message: t('notification.profile.update.message'),
      });
    })
  });

  const form = useForm<UpdateProfileType>({
    initialValues: user,
    validateInputOnChange: true,
    validate: {
      name: (value) => value.trim() ? null : t('profileForm.displayName.error'),
      image: (value) => !value || isValidUrl(value) ? null : t('profileForm.image.error'),
    },
  });

  // TODO public/private information sections: edit button to open form

  return (
    <form onSubmit={form.onSubmit((data) => useUpdate.mutate(data))}>
      <Stack>
        <Title order={2}>{user.name}</Title>
        <TextInput
          withAsterisk
          data-autofocus
          label={t('profileForm.displayName.label')}
          placeholder={t('profileForm.displayName.placeholder')}
          {...form.getInputProps('name')}
        />
        <RichTextField
          label={t('profileForm.introduction')}
          placeholder={t('profileForm.introduction')}
          formInputProps={form.getInputProps('introduction')}
        />
        <TextInput
          label={t('profileForm.image.label')}
          placeholder={t('profileForm.image.placeholder')}
          rightSection={<UserImage user={form.values} size={30}/>}
          {...form.getInputProps('image')}
        />
        <ThemeColorPicker
          value={form.getInputProps('themeColor').value as ThemeColor}
          onChange={form.getInputProps('themeColor').onChange as (newValue: ThemeColor) => void}
        />
        <LocationPicker
          required={false}
          placeholder={t('profileForm.location.placeholder')}
          description={t('profileForm.location.description')}
          location={getFormLocationValue(form)}
          setLocation={getFormLocationOnChange(form)}
        />
        <Group position="apart">
          <Button onClick={form.reset} color="gray" disabled={!form.isDirty()}>
            {t('button.reset')}
          </Button>
          <Button type="submit" disabled={!form.isValid() || !form.isDirty()}>
            {t('button.submit')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
