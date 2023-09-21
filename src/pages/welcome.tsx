import {Button, Card, Group, Stack, Title, useMantineTheme} from '@mantine/core';
import {signIn} from 'next-auth/react';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import {useEffect} from 'react';
import i18nConfig from '../../next-i18next.config.mjs';
import {useMediaQuery} from '@mantine/hooks';
import {useAuthenticated} from '../hooks/useAuthenticated';
import {useMyRouter} from '../hooks/useMyRouter';

export default function WelcomePage() {
  const theme = useMantineTheme();
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`);
  const {replaceRoute, locale, localePrefix} = useMyRouter();
  const {authenticated} = useAuthenticated();
  const {t} = useTranslation('common');

  useEffect(() => {
    if (authenticated) {
      void replaceRoute('/', undefined, {locale});
    }
  }, [authenticated, locale, replaceRoute]);

  return (!authenticated) && (
    <Stack h="100%" align="center" justify="center">
      <Card withBorder w={xs ? undefined : 245}>
        <Title order={1} align="center" pb="xl">
          {t('application.welcome')}
        </Title>
        <Group position="center">
          <Button
            variant={theme.primaryColor === 'dark' ? 'gradient' : undefined}
            onClick={() => void signIn(undefined, {callbackUrl: `${localePrefix}/`})}
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
