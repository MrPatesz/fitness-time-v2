import {SimpleGrid, useMantineTheme} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";
import {FunctionComponent} from "react";
import {BasicEventType} from "../../models/event/Event";
import {EventCard} from "./EventCard";

export const EventGrid: FunctionComponent<{
  events: BasicEventType[];
}> = ({events}) => {
  const theme = useMantineTheme();
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`);
  const md = useMediaQuery(`(min-width: ${theme.breakpoints.md}px)`);
  const xl = useMediaQuery(`(min-width: ${theme.breakpoints.xl}px)`);
  const xxl = useMediaQuery(`(min-width: ${theme.breakpoints.xs + theme.breakpoints.lg}px)`);
  const txl = useMediaQuery(`(min-width: ${theme.breakpoints.md + theme.breakpoints.lg}px)`);
  const qxl = useMediaQuery(`(min-width: ${theme.breakpoints.md + theme.breakpoints.xl}px)`);

  return (
    <SimpleGrid cols={qxl ? 7 : txl ? 6 : xxl ? 5 : xl ? 4 : md ? 3 : xs ? 2 : 1}>
      {events.map((event) => (
        <EventCard event={event} key={event.id}/>
      ))}
    </SimpleGrid>
  );
};
