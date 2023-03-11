import {MantineProvider, MantineThemeOverride} from "@mantine/core";
import {useColorScheme} from "@mantine/hooks";
import {ModalsProvider} from "@mantine/modals";
import {NotificationsProvider} from "@mantine/notifications";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import {FunctionComponent, useMemo} from "react";
import dayjs from "../../utils/dayjs";
import {ThemeColor} from "../user/ThemeColorPicker";

export const ThemeProvider: FunctionComponent<{
  children: JSX.Element;
}> = ({children}) => {
  const colorScheme = useColorScheme();
  const {locale} = useRouter();
  const {data: session} = useSession();

  dayjs.locale(locale);

  const myTheme = useMemo((): MantineThemeOverride => ({
    colorScheme,
    primaryColor: session?.user.themeColor ?? ThemeColor.VIOLET,
    loader: "dots",
    cursorType: "pointer",
    dateFormat: "MMMM DD, YYYY",
    defaultRadius: "md",
    datesLocale: locale,
  }), [colorScheme, session?.user.themeColor]);

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS theme={myTheme}>
      <ModalsProvider modalProps={{centered: true}}>
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
      </ModalsProvider>
    </MantineProvider>
  );
};
