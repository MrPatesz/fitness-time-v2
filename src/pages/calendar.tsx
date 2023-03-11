import {Affix, Stack, useMantineTheme} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";
import {openModal} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {useSession} from "next-auth/react";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import {useRouter} from "next/router";
import {useState} from "react";
import i18nConfig from "../../next-i18next.config.mjs";
import {EventForm} from "../components/event/EventForm";
import {QueryComponent} from "../components/QueryComponent";
import {BasicEventType} from "../models/Event";
import {api} from "../utils/api";
import dayjs from "../utils/dayjs";

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
  const theme = useMantineTheme();
  const {push: pushRoute, locale} = useRouter();
  const {data: session} = useSession();
  const {t} = useTranslation("common");
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`);

  const eventsQuery = api.event.getCalendar.useQuery();
  const updateEvent = api.event.update.useMutation({
    onSuccess: () => eventsQuery.refetch().then(() =>
      showNotification({
        color: "green",
        title: t("notification.update.title"),
        message: t("notification.update.message"),
      })
    ),
  });

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
        title: t("notification.failedToUpdate.title"),
        message: t("notification.failedToUpdate.message"),
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
        <QueryComponent resourceName={t("resource.calendar")} query={eventsQuery}>
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
                title: t("modal.event.create"),
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
            onEventClick={(e: { e: { data: BasicEventType } }) => pushRoute(`events/${e.e.data.id}`, undefined, {locale})}
            events={eventsQuery.data?.map((event) => {
              const offsetInHours = -1 * new Date(event.start).getTimezoneOffset();
              const start = dayjs(event.start).add(offsetInHours, "minutes").toDate();
              const end = dayjs(event.end).add(offsetInHours, "minutes").toDate();
              return {
                id: event.id,
                text: event.name,
                start,
                end,
                backColor: session?.user.id === event.creatorId ?
                  theme.fn.themeColor(theme.primaryColor) :
                  theme.fn.themeColor(event.creator.themeColor),
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

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
