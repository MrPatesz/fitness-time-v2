import {ActionIcon, Text, useMantineColorScheme} from '@mantine/core';
import {useRouter} from 'next/router';
import {FunctionComponent} from 'react';

export const LanguageToggle: FunctionComponent = () => {
  const {colorScheme} = useMantineColorScheme();
  const {locale = 'en', asPath, push: pushRoute} = useRouter();

  const dark = colorScheme === 'dark';
  const hu = locale === 'hu';

  return (
    <ActionIcon
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
