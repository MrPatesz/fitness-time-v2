import {Card, Group, Stack, Text, TypographyStylesProvider} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";
import i18nConfig from "../../../next-i18next.config.mjs";
import {EventGrid} from "../../components/event/EventGrid";
import {QueryComponent} from "../../components/QueryComponent";
import UserImage from "../../components/user/UserImage";
import {api} from "../../utils/api";
import {getBackgroundColor} from "../../utils/utilFunctions";

export default function UserDetailsPage() {
  const userImageSize = 100;

  const {query: {id}, isReady} = useRouter();
  const {t} = useTranslation("common");

  const userDetailsQuery = api.user.getById.useQuery(id as string, {
    enabled: isReady,
  });

  return (
    <QueryComponent resourceName={t("resource.userDetails")} query={userDetailsQuery}>
      {userDetailsQuery.data && (
        <Stack>
          <Group position="apart" align="start">
            <Stack sx={theme => ({width: `calc(100% - ${userImageSize + theme.spacing.md}px)`})}>
              <Text weight="bold" size="xl">
                {userDetailsQuery.data.name}
              </Text>
              {userDetailsQuery.data.introduction && (
                <Card withBorder sx={theme => ({backgroundColor: getBackgroundColor(theme)})}>
                  <TypographyStylesProvider>
                    <div dangerouslySetInnerHTML={{__html: userDetailsQuery.data.introduction}}/>
                  </TypographyStylesProvider>
                </Card>
              )}
            </Stack>
            <UserImage size={userImageSize} user={userDetailsQuery.data}/>
          </Group>
          {!!userDetailsQuery.data.createdEvents.length && (
            <>
              <Text size="lg">
                {t("userDetails.createdEvents")}
              </Text>
              <EventGrid events={userDetailsQuery.data.createdEvents}/>
            </>
          )}
        </Stack>
      )}
    </QueryComponent>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
