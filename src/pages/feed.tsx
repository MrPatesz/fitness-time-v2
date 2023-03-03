import {SimpleGrid, Stack, useMantineTheme} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";
import {useState} from "react";
import {EventCard} from "../components/event/EventCard";
import {FilterEventsComponent} from "../components/event/FilterEventsComponent";
import {QueryComponent} from "../components/QueryComponent";
import {BasicEventType} from "../models/Event";
import {api} from "../utils/api";

export default function FeedPage() {
  const [filteredList, setFilteredList] = useState<BasicEventType[]>([]);
  const eventsQuery = api.event.getFeed.useQuery();

  const theme = useMantineTheme();
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`);
  const md = useMediaQuery(`(min-width: ${theme.breakpoints.md}px)`);
  const xl = useMediaQuery(`(min-width: ${theme.breakpoints.xl}px)`);
  const xxl = useMediaQuery(`(min-width: ${theme.breakpoints.xs + theme.breakpoints.lg}px)`);
  const txl = useMediaQuery(`(min-width: ${theme.breakpoints.md + theme.breakpoints.lg}px)`);
  const qxl = useMediaQuery(`(min-width: ${theme.breakpoints.md + theme.breakpoints.xl}px)`);

  return (
    <Stack>
      <FilterEventsComponent
        events={eventsQuery.data ?? []}
        setFilteredEvents={setFilteredList}
        filterKey="FeedPageFilter"
      />
      <QueryComponent resourceName="Feed" query={eventsQuery}>
        <SimpleGrid cols={qxl ? 7 : txl ? 6 : xxl ? 5 : xl ? 4 : md ? 3 : xs ? 2 : 1}>
          {filteredList.map((event) => (
            <EventCard event={event} key={event.id}/>
          ))}
        </SimpleGrid>
      </QueryComponent>
    </Stack>
  );
}
