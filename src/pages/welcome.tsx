import {Button, Card, Group, Stack,} from '@mantine/core';
import {signIn, useSession} from 'next-auth/react';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import {useRouter} from 'next/router';
import {useEffect} from 'react';
import i18nConfig from '../../next-i18next.config.mjs';

export default function WelcomePage() {
  const {replace: replaceRoute, locale = 'en', defaultLocale} = useRouter();
  const {status} = useSession();
  const {t} = useTranslation('common');

  useEffect(() => {
    if (status === 'authenticated') {
      void replaceRoute('/', undefined, {locale});
    }
  }, [status, locale, replaceRoute]);

  if (status !== 'unauthenticated') {
    return <></>;
  }

  return (
    <Stack align="center" justify="center" sx={{height: '100vh'}}>
      <Card withBorder>
        <h1 style={{marginTop: 0}}>
          {t('application.welcome')}
        </h1>
        <Group position="center">
          <Button
            onClick={() => void signIn(undefined, {callbackUrl: locale !== defaultLocale ? `/${locale}/` : '/'})}
          >
            {t('button.login')}
          </Button>
        </Group>
      </Card>
    </Stack>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ['common'], i18nConfig))},
});
