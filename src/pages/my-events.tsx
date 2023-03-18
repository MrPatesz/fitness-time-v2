import {ActionIcon, Affix, Group, Stack, Table, Text, useMantineTheme} from "@mantine/core";
import {openConfirmModal, openModal} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";
import {useState} from "react";
import {Pencil, Plus, Trash} from "tabler-icons-react";
import i18nConfig from "../../next-i18next.config.mjs";
import {EventForm} from "../components/event/EventForm";
import {FilterEventsComponent} from "../components/event/FilterEventsComponent";
import {QueryComponent} from "../components/QueryComponent";
import useFilteredEvents from "../hooks/useFilteredEvents";
import {BasicEventType} from "../models/Event";
import {api} from "../utils/api";
import {defaultEventFilters} from "../utils/defaultObjects";
import {getLongDateFormatter, getPriceFormatter} from "../utils/formatters";
import {EventFilters} from "./feed";

export default function MyEventsPage() {
  const theme = useMantineTheme();
  const {push: pushRoute, locale} = useRouter();
  const {t} = useTranslation("common");
  const longDateFormatter = getLongDateFormatter(locale as string);
  const priceFormatter = getPriceFormatter(locale as string);

  const eventsQuery = api.event.getAllCreated.useQuery();
  const deleteEvent = api.event.delete.useMutation({
    onSuccess: () => eventsQuery.refetch().then(() =>
      showNotification({
        color: "green",
        title: t("notification.event.delete.title"),
        message: t("notification.event.delete.message"),
      })),
  });

  const [filters, setFilters] = useState<EventFilters>(defaultEventFilters);
  const filteredList = useFilteredEvents(eventsQuery.data, filters);

  const onDeleteClick = (event: BasicEventType) => openConfirmModal({
    title: t("modal.event.delete.title"),
    children: (
      <Stack>
        <Text>
          {t("modal.event.delete.message")}
        </Text>
        <Text weight="bold">
          "{event.name}"
        </Text>
      </Stack>
    ),
    labels: {confirm: t("button.confirm"), cancel: t("button.cancel")},
    onConfirm: () => deleteEvent.mutate(event.id),
  });

  return (
    <>
      <Stack>
        <FilterEventsComponent filters={filters} setFilters={setFilters}/>
        <QueryComponent resourceName={t("resource.myEvents")} query={eventsQuery}>
          <Table highlightOnHover withBorder withColumnBorders>
            <thead>
            <tr>
              <th>{t("common.name")}</th>
              <th>{t("myEvents.dateTime")}</th>
              <th>{t("common.location")}</th>
              <th>{t("common.price")}</th>
              <th>{t("myEvents.limit")}</th>
              {/* <th>{t("myEvents.recurring")}</th> */}
              <th>{t("myEvents.actions")}</th>
            </tr>
            </thead>
            <tbody>
            {filteredList.map((event) => (
              <tr
                key={event.id}
                onClick={() => pushRoute(`events/${event.id}`, undefined, {locale})}
                style={{cursor: "pointer"}}
              >
                <td>{event.name}</td>
                <td>{longDateFormatter.formatRange(event.start, event.end)}</td>
                <td>{event.location.address}</td>
                <td>{event.price && priceFormatter.format(event.price)}</td>
                <td>{event.limit}</td>
                {/* <td>{event.recurring.toString()}</td> */}
                <td>
                  <Group spacing="xs">
                    <ActionIcon
                      // disabled={event.isArchive}
                      variant="transparent"
                      size="md"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal({
                          title: t("modal.event.edit"),
                          children: <EventForm editedEventId={event.id}/>,
                        });
                      }}
                    >
                      <Pencil/>
                    </ActionIcon>
                    <ActionIcon
                      // disabled={event.isArchive}
                      variant="transparent"
                      size="md"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        onDeleteClick(event);
                      }}
                    >
                      <Trash/>
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
            </tbody>
          </Table>
        </QueryComponent>
      </Stack>
      <Affix position={{bottom: theme.spacing.md, right: theme.spacing.md}}>
        <ActionIcon
          variant="default"
          size="xl"
          onClick={() => openModal({
            title: t("modal.event.create"),
            children: <EventForm/>,
          })}
        >
          <Plus/>
        </ActionIcon>
      </Affix>
    </>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
