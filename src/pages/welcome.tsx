import {Button, Card, Group, Stack, Title, useMantineTheme} from '@mantine/core';
import {signIn, useSession} from 'next-auth/react';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import {useRouter} from 'next/router';
import {useEffect} from 'react';
import i18nConfig from '../../next-i18next.config.mjs';
import {useMediaQuery} from '@mantine/hooks';

export default function WelcomePage() {
  const theme = useMantineTheme();
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`);
  const {replace: replaceRoute, locale = 'en', defaultLocale} = useRouter();
  const {status} = useSession();
  const {t} = useTranslation('common');

  useEffect(() => {
    if (status === 'authenticated') {
      void replaceRoute('/', undefined, {locale});
    }
  }, [status, locale, replaceRoute]);

  return (status === 'unauthenticated') && (
    <Stack h="100%" align="center" justify="center">
      <Card withBorder w={xs ? undefined : 245}>
        <Title order={1} align="center" pb="xl">
          {t('application.welcome')}
        </Title>
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
