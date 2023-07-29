import {Affix, useMantineTheme} from "@mantine/core";
import {DatePicker} from "@mantine/dates";
import {useMediaQuery} from "@mantine/hooks";
import {openModal} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {useSession} from "next-auth/react";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import {useRouter} from "next/router";
import {ComponentType, useState} from "react";
import i18nConfig from "../../next-i18next.config.mjs";
import {CenteredLoader} from "../components/CenteredLoader";
import {BasicEventType} from "../models/Event";
import {api} from "../utils/api";
import dayjs from "../utils/dayjs";
import {getFirstDayOfWeek} from "../utils/utilFunctions";
import {CreateEventForm} from "../components/event/CreateEventForm";
import {QueryComponent} from "../components/QueryComponent";

// TODO this is not complete
interface DayPilotCalendarInputProps {
  theme: string | undefined;
  viewType: "Week";
  timeFormat: "Clock24Hours";
  headerDateFormat: string;
  heightSpec: "Full";
  eventMoveHandling: "JavaScript"
  eventResizeHandling: "JavaScript"
  locale: string;
  onTimeRangeSelected: (event: { start: { value: string }; end: { value: string }; }) => void;
  onEventResize: (event: {
    e: { data: { resource: BasicEventType } };
    newStart: { value: string };
    newEnd: { value: string };
  }) => void;
  onEventMove: (event: {
    e: { data: { resource: BasicEventType } };
    newStart: { value: string };
    newEnd: { value: string };
  }) => void;
  durationBarVisible: boolean;
  startDate: Date;
  onEventClick: (e: {
    e: { data: BasicEventType }
  }) => void;
  events: Array<{
    id: number;
    text: string;
    start: Date;
    end: Date;
    backColor: string;
    cssClass: string;
    resource: BasicEventType;
  }> | undefined;
}

const DayPilotCalendar = dynamic<DayPilotCalendarInputProps>(
  () => import("@daypilot/daypilot-lite-react").then((mod: {
    DayPilotCalendar: ComponentType<DayPilotCalendarInputProps>
  }) => mod.DayPilotCalendar),
  {
    ssr: false,
    loading: () => <CenteredLoader/>,
  }
);

export default function CalendarPage() {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const theme = useMantineTheme();
  const {push: pushRoute, locale = "en"} = useRouter();
  const {data: session} = useSession();
  const {t} = useTranslation("common");
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`);

  const eventsQuery = api.event.getCalendar.useQuery();
  const updateEvent = api.event.update.useMutation({
    onSuccess: () => eventsQuery.refetch().then(() =>
      showNotification({
        color: "green",
        title: t("notification.event.update.title"),
        message: t("notification.event.update.message"),
      })
    ),
  });

  const onIntervalChange = (event: {
    e: { data: { resource: BasicEventType } };
    newStart: { value: string };
    newEnd: { value: string };
  }) => {
    const newStartDate = new Date(event.newStart.value);
    const newEndDate = new Date(event.newEnd.value);

    if (
      event.e.data.resource.start.getTime() === newStartDate.getTime() &&
      event.e.data.resource.end.getTime() === newEndDate.getTime()
    ) {
      return;
    }

    if (session?.user.id === event.e.data.resource.creatorId) {
      updateEvent.mutate({
        id: event.e.data.resource.id,
        event: {
          ...event.e.data.resource,
          start: newStartDate,
          end: newEndDate,
        }
      });
    } else {
      showNotification({
        color: "red",
        title: t("notification.event.failedToUpdate.title"),
        message: t("notification.event.failedToUpdate.message"),
      });
    }
  };

  return (
    <>
      <QueryComponent resourceName={t("resource.calendar")} query={eventsQuery}>
        <DayPilotCalendar
          theme={theme.colorScheme === "dark" ? "dark" : undefined}
          viewType="Week"
          timeFormat="Clock24Hours"
          headerDateFormat={xs ? "MMMM d" : "d/MM"}
          heightSpec="Full"
          eventMoveHandling="JavaScript"
          eventResizeHandling="JavaScript"
          locale={locale}
          onTimeRangeSelected={(event: {
            start: { value: string };
            end: { value: string };
          }) => {
            openModal({
              title: t("modal.event.create"),
              zIndex: 402,
              children: (
                <CreateEventForm
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
          startDate={startDate}
          onEventClick={(e: {
            e: { data: BasicEventType }
          }) => void pushRoute(`/events/${e.e.data.id}`, undefined, {locale})}
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
      <Affix position={{top: 10, left: xs ? (211 + theme.spacing.md) : 104}} zIndex={401}>
        <DatePicker
          w={155}
          clearable={false}
          locale={locale}
          value={startDate}
          onChange={(value) => value && setStartDate(value)}
          firstDayOfWeek={getFirstDayOfWeek(locale)}
        />
      </Affix>
    </>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
