import {ActionIcon, Text, useMantineColorScheme} from '@mantine/core';
import {FunctionComponent} from 'react';
import {useTranslation} from 'next-i18next';
import {useMyRouter} from '../../hooks/useMyRouter';

export const LanguageToggle: FunctionComponent = () => {
  const {colorScheme} = useMantineColorScheme();
  const {route, pushRoute, isDefaultLocale} = useMyRouter();
  const {t} = useTranslation('common');

  const dark = colorScheme === 'dark';

  return (
    <ActionIcon
      title={t('application.language')}
      size="lg"
      variant={dark ? 'outline' : 'default'}
      onClick={() => void pushRoute(route, undefined, {locale: isDefaultLocale ? 'hu' : 'en'})}
    >
      <Text>
        {isDefaultLocale ? '🇭🇺' : '🇺🇸'}
      </Text>
    </ActionIcon>
  );
};
