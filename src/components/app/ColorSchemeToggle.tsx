import {ActionIcon, useMantineColorScheme} from "@mantine/core";
import {IconMoonStars, IconSun} from "@tabler/icons";
import {FunctionComponent} from "react";

export const ColorSchemeToggle: FunctionComponent = () => {
  const {colorScheme, toggleColorScheme} = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <ActionIcon
      size="lg"
      variant={dark ? "outline" : "default"}
      onClick={() => toggleColorScheme()}
    >
      {dark ? <IconSun/> : <IconMoonStars/>}
    </ActionIcon>
  );
};
