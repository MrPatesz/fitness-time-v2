import {type AppType} from "next/app";
import {type Session} from "next-auth";
import {SessionProvider} from "next-auth/react";
import Head from "next/head";

import {api} from "../utils/api";

import "../styles/globals.css";
import {NotificationsProvider} from "@mantine/notifications";
import {MantineProvider, MantineThemeOverride} from "@mantine/core";
import {useColorScheme} from "@mantine/hooks";
import {ApplicationShell} from "../components/ApplicationShell";

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: {session, ...pageProps},
}) => {
    const colorScheme = useColorScheme();

    const myTheme: MantineThemeOverride = {
        colorScheme,
        primaryColor: "violet",
        loader: "dots",
        cursorType: "pointer",
        dateFormat: "MMMM DD, YYYY",
    };

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

export default api.withTRPC(MyApp);
