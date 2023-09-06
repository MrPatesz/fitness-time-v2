import {ActionIcon, Text, useMantineColorScheme} from '@mantine/core';
import {useRouter} from 'next/router';
import {FunctionComponent} from 'react';
import {useTranslation} from 'next-i18next';

export const LanguageToggle: FunctionComponent = () => {
  const {colorScheme} = useMantineColorScheme();
  const {locale = 'en', asPath, push: pushRoute} = useRouter();
  const {t} = useTranslation('common');

  const dark = colorScheme === 'dark';
  const hu = locale === 'hu';

  return (
    <ActionIcon
      title={t('application.language')}
      size="lg"
      variant={dark ? 'outline' : 'default'}
      onClick={() => void pushRoute(asPath, undefined, {locale: hu ? 'en' : 'hu'})}
    >
      <Text>
        {hu ? '🇺🇸' : '🇭🇺'}
      </Text>
    </ActionIcon>
  );
};
