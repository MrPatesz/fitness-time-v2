import {MantineTheme} from "@mantine/core";

export const refreshSession = () => {
  const event = new Event("visibilitychange");
  document.dispatchEvent(event);
};

export const getBackgroundColor = (theme: MantineTheme) => {
  return theme.colorScheme === "dark"
    ? theme.colors.dark[8]
    : theme.colors.gray[0];
};