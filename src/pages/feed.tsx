import {Stack} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useState} from "react";
import i18nConfig from "../../next-i18next.config.mjs";
import {EventGrid} from "../components/event/EventGrid";
import {FilterBy, FilterEventsComponent, OrderBy} from "../components/event/FilterEventsComponent";
import {QueryComponent} from "../components/QueryComponent";
import useFilteredEvents from "../hooks/useFilteredEvents";
import {api} from "../utils/api";
import {defaultEventFilters} from "../utils/defaultObjects";

export interface EventFilters {
  searchTerm: string;
  orderBy: OrderBy;
  ascending: boolean;
  tags: FilterBy[];
}

export default function FeedPage() {
  const {t} = useTranslation("common");

  const eventsQuery = api.event.getFeed.useQuery();
  const [filters, setFilters] = useState<EventFilters>(defaultEventFilters);
  const filteredList = useFilteredEvents(eventsQuery.data, filters);

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
