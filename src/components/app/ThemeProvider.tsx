import {MantineProvider, MantineThemeOverride} from "@mantine/core";
import {useColorScheme} from "@mantine/hooks";
import {NotificationsProvider} from "@mantine/notifications";
import {useSession} from "next-auth/react";
import {FunctionComponent, useMemo} from "react";
import {ThemeColor} from "../user/ThemeColorPicker";

export const ThemeProvider: FunctionComponent<{
  children: JSX.Element;
}> = ({children}) => {
  const colorScheme = useColorScheme();
  const {data: session} = useSession();

  const myTheme = useMemo((): MantineThemeOverride => ({
    colorScheme,
    primaryColor: session?.user.themeColor ?? ThemeColor.VIOLET,
    loader: "dots",
    cursorType: "pointer",
    dateFormat: "MMMM DD, YYYY",
    defaultRadius: "md",
  }), [colorScheme, session?.user.themeColor]);

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS theme={myTheme}>
      <NotificationsProvider>
        {children}
      </NotificationsProvider>
    </MantineProvider>
  );
};
