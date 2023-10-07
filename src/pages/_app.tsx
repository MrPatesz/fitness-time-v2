import {type Session} from 'next-auth';
import {SessionProvider} from 'next-auth/react';
import {appWithTranslation} from 'next-i18next';
import {type AppType} from 'next/app';
import Head from 'next/head';
import i18nConfig from '../../next-i18next.config.mjs';
import {ApplicationShell} from '../components/app/ApplicationShell';
import {ThemeProvider} from '../components/app/ThemeProvider';
import {api} from '../utils/api';
import {Analytics} from '@vercel/analytics/react';
import '@uploadthing/react/styles.css';
import '../styles/uploadthing.css';
import '../styles/calendar.css';
import '../styles/globals.css';

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
      <Analytics/>
    </>
  );
};

const i18nApp = appWithTranslation(App, i18nConfig);

export default api.withTRPC(i18nApp);
