import {ActionIcon, useMantineColorScheme} from '@mantine/core';
import {IconMoonStars, IconSun} from '@tabler/icons';
import {FunctionComponent} from 'react';

export const ColorSchemeToggle: FunctionComponent = () => {
  const mantineColorScheme = useMantineColorScheme();
  const dark = mantineColorScheme.colorScheme === 'dark';

  return (
    <ActionIcon
      size="lg"
      variant={dark ? 'outline' : 'default'}
      onClick={() => mantineColorScheme.toggleColorScheme()}
    >
      {dark ? <IconSun/> : <IconMoonStars/>}
    </ActionIcon>
  );
};
