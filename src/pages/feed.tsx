import {Stack} from "@mantine/core";
import {useState} from "react";
import {EventGrid} from "../components/event/EventGrid";
import {FilterEventsComponent} from "../components/event/FilterEventsComponent";
import {QueryComponent} from "../components/QueryComponent";
import {BasicEventType} from "../models/Event";
import {api} from "../utils/api";

export default function FeedPage() {
  const [filteredList, setFilteredList] = useState<BasicEventType[]>([]);
  const eventsQuery = api.event.getFeed.useQuery();

  return (
    <Stack>
      <FilterEventsComponent
        events={eventsQuery.data ?? []}
        setFilteredEvents={setFilteredList}
        filterKey="FeedPageFilter"
      />
      <QueryComponent resourceName="Feed" query={eventsQuery}>
        <EventGrid events={filteredList}/>
      </QueryComponent>
    </Stack>
  );
}
