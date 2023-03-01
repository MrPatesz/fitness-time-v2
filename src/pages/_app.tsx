import {type Session} from "next-auth";
import {SessionProvider} from "next-auth/react";
import {type AppType} from "next/app";
import Head from "next/head";
import {ApplicationShell} from "../components/app/ApplicationShell";
import {ThemeProvider} from "../components/app/ThemeProvider";
import "../styles/calendar.css";
import "../styles/globals.css";
import "../styles/navigator.css";
import {api} from "../utils/api";

const App: AppType<{ session: Session | null }> = ({
                                                     Component,
                                                     pageProps: {session, ...pageProps},
                                                   }) => {
  return (
    <>
      <Head>
        <title>Fitness Time</title>
      </Head>
      <SessionProvider session={session}>
        <ThemeProvider>
          <ApplicationShell>
            <Component {...pageProps} />
          </ApplicationShell>
        </ThemeProvider>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(App);
