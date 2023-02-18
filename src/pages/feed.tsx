import {SimpleGrid, Stack, useMantineTheme} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";
import React, {useState} from "react";
import {EventCard} from "../components/event/EventCard";
import {FilterEventsComponent} from "../components/event/FilterEventsComponent";
import {QueryComponent} from "../components/QueryComponent";
import {BasicEventType} from "../models/Event";
import {api} from "../utils/api";

export default function FeedPage() {
  const [filteredList, setFilteredList] = useState<BasicEventType[]>([]);
  const eventsQuery = api.event.getAll.useQuery(); // TODO getFeed

  const theme = useMantineTheme();
  const medium = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`);
  const large = useMediaQuery(`(min-width: ${theme.breakpoints.md}px)`);
  const extraLarge = useMediaQuery(`(min-width: ${theme.breakpoints.xl}px)`);

  return (
    <Stack>
      <FilterEventsComponent
        events={eventsQuery.data ?? []}
        setFilteredEvents={setFilteredList}
        filterKey="FeedPageFilter"
      />
      <QueryComponent resourceName="Feed" query={eventsQuery}>
        <SimpleGrid cols={extraLarge ? 4 : large ? 3 : medium ? 2 : 1}>
          {filteredList.map((event) => (
            <EventCard event={event} key={event.id}/>
          ))}
        </SimpleGrid>
      </QueryComponent>
    </Stack>
  );
}
