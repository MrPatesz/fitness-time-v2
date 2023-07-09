import {Button, Card, Group, Stack,} from "@mantine/core";
import {signIn, useSession} from "next-auth/react";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";
import i18nConfig from "../../next-i18next.config.mjs";
import {useEffect} from "react";

export default function WelcomePage() {
  const {replace: replaceRoute, locale, defaultLocale} = useRouter();
  const {data: session} = useSession();
  const {t} = useTranslation("common");

  useEffect(() => {
    if (session) {
      replaceRoute("/", undefined, {locale});
    }
  }, [session]);

  return (
    <Stack align="center" justify="center" sx={{height: "100vh"}}>
      <Card withBorder>
        <h1 style={{marginTop: 0}}>
          {t("application.welcome")}
        </h1>
        <Group position="center">
          <Button
            onClick={() => signIn(undefined, {callbackUrl: locale !== defaultLocale ? `/${locale}/` : "/"})}
          >
            {t("button.login")}
          </Button>
        </Group>
      </Card>
    </Stack>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
