import {Stack} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useState} from "react";
import i18nConfig from "../../next-i18next.config.mjs";
import {EventGrid} from "../components/event/EventGrid";
import {FilterEventsComponent} from "../components/event/FilterEventsComponent";
import {QueryComponent} from "../components/QueryComponent";
import {BasicEventType} from "../models/Event";
import {api} from "../utils/api";

export default function FeedPage() {
  const [filteredList, setFilteredList] = useState<BasicEventType[]>([]);
  const eventsQuery = api.event.getFeed.useQuery();
  const {t} = useTranslation("common");

  return (
    <Stack>
      <FilterEventsComponent
        events={eventsQuery.data ?? []}
        setFilteredEvents={setFilteredList}
        filterKey="FeedPageFilter"
      />
      <QueryComponent resourceName={t("resource.feed")} query={eventsQuery}>
        <EventGrid events={filteredList}/>
      </QueryComponent>
    </Stack>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
