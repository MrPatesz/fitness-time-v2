import {Stack} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import i18nConfig from "../../next-i18next.config.mjs";
import {EventGrid} from "../components/event/EventGrid";
import {FilterBy, FilterEventsComponent, OrderBy} from "../components/event/FilterEventsComponent";
import {QueryComponent} from "../components/QueryComponent";
import useFilteredEvents from "../hooks/useFilteredEvents";
import {api} from "../utils/api";

export interface EventFilters {
  searchTerm: string;
  orderBy: OrderBy;
  ascending: boolean;
  tags: FilterBy[];
}

export default function FeedPage() {
  const {t} = useTranslation("common");

  const eventsQuery = api.event.getFeed.useQuery();
  const {filteredList, filters, setFilters} = useFilteredEvents(eventsQuery.data);

  return (
    <Stack>
      <FilterEventsComponent filters={filters} setFilters={setFilters}/>
      <QueryComponent resourceName={t("resource.feed")} query={eventsQuery}>
        <EventGrid events={filteredList}/>
      </QueryComponent>
    </Stack>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
