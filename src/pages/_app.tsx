import {MantineProvider, MantineThemeOverride} from "@mantine/core";
import {useColorScheme} from "@mantine/hooks";
import {NotificationsProvider} from "@mantine/notifications";
import {type Session} from "next-auth";
import {SessionProvider} from "next-auth/react";
import {type AppType} from "next/app";
import Head from "next/head";
import {useMemo} from "react";
import {ApplicationShell} from "../components/ApplicationShell";
import "../styles/calendar.css";

import "../styles/globals.css";
import "../styles/navigator.css";

import {api} from "../utils/api";

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: {session, ...pageProps},
}) => {
  const colorScheme = useColorScheme();

  const myTheme = useMemo((): MantineThemeOverride => ({
      colorScheme,
      primaryColor: "violet", // TODO color: session?.user.color ?? "violet"
      loader: "dots",
      cursorType: "pointer",
      dateFormat: "MMMM DD, YYYY",
      defaultRadius: "md"
    }), [colorScheme, session?.user] // TODO color: session?.user.color]
  );

  return (
    <>
      <Head>
        <title>Fitness Time</title>
      </Head>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={myTheme}>
        <NotificationsProvider>
          <SessionProvider session={session}>
            <ApplicationShell>
              <Component {...pageProps} />
            </ApplicationShell>
          </SessionProvider>
        </NotificationsProvider>
      </MantineProvider>
    </>
  );
};

export default api.withTRPC(App);
