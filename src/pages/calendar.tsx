import {Affix, Stack, useMantineTheme} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";
import {openModal} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import dayjs from "dayjs";
import {useSession} from "next-auth/react";
import dynamic from "next/dynamic";
import {useRouter} from "next/router";
import {useState} from "react";
import {EventForm} from "../components/event/EventForm";
import {QueryComponent} from "../components/QueryComponent";
import {BasicEventType} from "../models/Event";
import {api} from "../utils/api";

const DayPilotNavigator: any = dynamic(
  () =>
    import("@daypilot/daypilot-lite-react").then(
      (mod) => mod.DayPilotNavigator
    ),
  {ssr: false}
);
const DayPilotCalendar: any = dynamic(
  () =>
    import("@daypilot/daypilot-lite-react").then((mod) => mod.DayPilotCalendar),
  {ssr: false}
);

export default function CalendarPage() {
  const [startDate, setStartDate] = useState(new Date());

  const queryContext = api.useContext();
  const eventsQuery = api.event.getCalendar.useQuery();
  const updateEvent = api.event.update.useMutation({
    onSuccess: () => queryContext.event.invalidate().then(() =>
      showNotification({
        color: "green",
        title: "Updated event!",
        message: "The event has been moved.",
      })
    ),
  });
  const theme = useMantineTheme();
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`);
  const router = useRouter();
  const {data: session} = useSession();

  const onIntervalChange = (event: {
    e: { data: { resource: BasicEventType } };
    newStart: { value: string };
    newEnd: { value: string };
  }) => {
    if (session?.user.id === event.e.data.resource.creatorId) {
      updateEvent.mutate({
        id: event.e.data.resource.id,
        event: {
          ...event.e.data.resource,
          start: new Date(event.newStart.value),
          end: new Date(event.newEnd.value),
        }
      });
    } else {
      showNotification({
        color: "red",
        title: "Could not update event!",
        message: "You do not own this event!",
      });
    }
  };

  const navigator = (
    <DayPilotNavigator
      theme={theme.colorScheme === "dark" ? "dark_navigator" : undefined}
      selectMode="week"
      onTimeRangeSelected={(args: { day: Date }) => setStartDate(args.day)}
    />
  );

  return (
    <>
      <Stack>
        {!xs && navigator}
        <QueryComponent resourceName="Calendar" query={eventsQuery}>
          <DayPilotCalendar
            theme={theme.colorScheme === "dark" ? "dark" : undefined}
            viewType="Week"
            timeFormat="Clock24Hours"
            headerDateFormat={xs ? "MMMM d" : "d/MM"}
            heightSpec="Full"
            eventMoveHandling="JavaScript"
            eventResizeHandling="JavaScript"
            onTimeRangeSelected={(event: {
              start: { value: string };
              end: { value: string };
            }) => {
              openModal({
                title: "Create Event",
                zIndex: 402,
                closeOnClickOutside: false,
                children: (
                  <EventForm
                    initialInterval={{
                      start: new Date(event.start.value),
                      end: new Date(event.end.value),
                    }}
                  />
                ),
              });
            }}
            onEventResize={onIntervalChange}
            onEventMove={onIntervalChange}
            durationBarVisible={false}
            businessBeginsHour={8}
            businessEndsHour={17}
            startDate={startDate}
            onEventClick={(e: any) => router.push(`events/${e.e.data.id}`)}
            events={eventsQuery.data?.map((event) => {
              const offsetInHours =
                (new Date(event.start).getTimezoneOffset() / 60) * -1;
              const start = dayjs(event.start)
                .hour(dayjs(event.start).hour() + offsetInHours)
                .toDate();
              const end = dayjs(event.end)
                .hour(dayjs(event.end).hour() + offsetInHours)
                .toDate();
              return {
                id: event.id,
                text: event.name,
                start,
                end,
                backColor: session?.user.id === event.creatorId ?
                  theme.fn.themeColor(theme.primaryColor) :
                  (event.creator.themeColor ?
                      theme.fn.themeColor(event.creator.themeColor) :
                      theme.fn.themeColor(theme.primaryColor, 5)
                  ),
                cssClass: "calendar-event",
                resource: event,
              };
            })}
          />
        </QueryComponent>
      </Stack>
      {xs && (
        <Affix position={{bottom: 0, left: -1}} zIndex={401}>
          {navigator}
        </Affix>
      )}
    </>
  );
}
