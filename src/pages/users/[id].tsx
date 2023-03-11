import {Group, Stack, Text} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";
import i18nConfig from "../../../next-i18next.config.mjs";
import {EventGrid} from "../../components/event/EventGrid";
import {QueryComponent} from "../../components/QueryComponent";
import UserImage from "../../components/user/UserImage";
import {api} from "../../utils/api";

export default function UserDetailsPage() {
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
            <Stack>
              <Text weight="bold" size="xl">
                {userDetailsQuery.data.name}
              </Text>
              <Text>{userDetailsQuery.data.introduction}</Text>
            </Stack>
            <UserImage user={userDetailsQuery.data}/>
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
