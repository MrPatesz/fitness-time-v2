import {Card, Stack} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import i18nConfig from "../../../next-i18next.config.mjs";
import {QueryComponent} from "../../components/QueryComponent";
import {api} from "../../utils/api";

export default function EventsPage() {
  const {t} = useTranslation("common");

  const eventsQuery = api.event.getAll.useQuery();

  return (
    <QueryComponent resourceName={t("resource.events")} query={eventsQuery}>
      <Stack>
        {eventsQuery.data?.map(event => (
          <Card key={event.id} withBorder>
            {event.name}
          </Card>
        ))}
      </Stack>
    </QueryComponent>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});