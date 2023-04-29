import {
  ActionIcon,
  Box,
  Checkbox,
  Group,
  MantineNumberSize,
  Stack,
  Text,
  TextInput,
  useMantineTheme
} from "@mantine/core";
import {useDebouncedValue} from "@mantine/hooks";
import {openConfirmModal, openModal} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {IconSearch} from "@tabler/icons";
import {DataTable, DataTableSortStatus} from "mantine-datatable";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";
import {FunctionComponent, useEffect, useState} from "react";
import {Pencil, Plus, Trash} from "tabler-icons-react";
import {BasicEventType} from "../../models/event/Event";
import {SortDirection, SortEventByProperty} from "../../models/event/PaginateEvents";
import {api} from "../../utils/api";
import {getLongDateFormatter, getPriceFormatter} from "../../utils/formatters";
import {QueryComponent} from "../QueryComponent";
import {EventForm} from "./EventForm";

export enum EventTableDisplayPlace {
  CONTROL_PANEL = "CONTROL_PANEL",
  EVENTS_PAGE = "EVENTS_PAGE",
}

const DATE_TIME: string = "dateTime";
export const PAGE_SIZES: number[] = [10, 25, 50];

const EventTable: FunctionComponent<{
  eventTableDisplayPlace: EventTableDisplayPlace;
}> = ({eventTableDisplayPlace}) => {
  const [archive, setArchive] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES.at(0) as number);
  const [sortBy, setSortBy] = useState<DataTableSortStatus>({columnAccessor: DATE_TIME, direction: "desc"});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);

  const theme = useMantineTheme();
  const {push: pushRoute, locale} = useRouter();
  const {t} = useTranslation("common");
  const longDateFormatter = getLongDateFormatter(locale as string);
  const priceFormatter = getPriceFormatter(locale as string);

  const eventsQuery = api.event.getPaginatedEvents.useQuery({
    archive: archive,
    page: page,
    pageSize: pageSize,
    sortBy: {
      property: (sortBy.columnAccessor === DATE_TIME ? "start" : sortBy.columnAccessor) as SortEventByProperty,
      direction: sortBy.direction as SortDirection,
    },
    searchQuery: debouncedSearchQuery,
    createdOnly: eventTableDisplayPlace === EventTableDisplayPlace.CONTROL_PANEL,
  });
  const deleteEvent = api.event.delete.useMutation({
    onSuccess: () => eventsQuery.refetch().then(() =>
      showNotification({
        color: "green",
        title: t("notification.event.delete.title"),
        message: t("notification.event.delete.message"),
      })),
  });

  useEffect(() => {
    if (eventsQuery.data?.events.length === 0 && page !== 1) {
      setPage(page - 1);
    }
  }, [eventsQuery.data, page]);

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
    <Stack sx={{height: "100%"}}>
      <Group>
        <TextInput
          sx={{flexGrow: 1}}
          icon={<IconSearch/>}
          placeholder={t("filterEvents.search") as string}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
        <Checkbox
          label={t("myEvents.archive")}
          checked={archive}
          onChange={(e) => setArchive(e.currentTarget.checked)}
        />
        <ActionIcon
          size="lg"
          variant="filled"
          color={theme.fn.themeColor(theme.primaryColor)}
          onClick={() => openModal({
            title: t("modal.event.create"),
            children: <EventForm/>,
          })}
        >
          <Plus/>
        </ActionIcon>
      </Group>
      <QueryComponent resourceName={t("resource.events")} query={eventsQuery}>
        <Box
          sx={{
            height: "100%",
            minHeight: 300,
            position: "relative",
          }}
        >
          <DataTable
            sx={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
            highlightOnHover
            withBorder
            withColumnBorders
            textSelectionDisabled
            borderRadius={theme.defaultRadius as MantineNumberSize}
            noRecordsText={t("myEvents.noRecords") as string}
            sortStatus={sortBy}
            onSortStatusChange={setSortBy}
            page={page}
            onPageChange={setPage}
            recordsPerPageOptions={PAGE_SIZES}
            recordsPerPageLabel={t("myEvents.recordsPerPage") as string}
            recordsPerPage={pageSize}
            onRecordsPerPageChange={(newPageSize) => {
              setPageSize(newPageSize);
              setPage(1);
            }}
            records={eventsQuery.data?.events}
            totalRecords={eventsQuery.data?.size}
            onRowClick={(event) => pushRoute(`/events/${event.id}`, undefined, {locale})}
            columns={[
              {
                accessor: "name",
                title: t("common.name"),
                sortable: true,
              },
              {
                accessor: DATE_TIME,
                title: t("myEvents.dateTime"),
                sortable: true,
                render: ({start, end}) => longDateFormatter.formatRange(start, end),
              },
              {
                accessor: "location",
                title: t("common.location"),
                render: ({location}) => location.address,
              },
              {
                accessor: "price",
                title: t("common.price"),
                sortable: true,
                render: ({price}) => price && priceFormatter.format(price),
              },
              {
                accessor: "limit",
                title: t("myEvents.limit"),
                sortable: true,
              },
              {
                accessor: "creatorName",
                title: t("myEvents.creator"),
                hidden: eventTableDisplayPlace === EventTableDisplayPlace.CONTROL_PANEL,
                render: ({creator}) => creator.name,
              },
              {
                accessor: "actions",
                title: t("myEvents.actions"),
                hidden: eventTableDisplayPlace === EventTableDisplayPlace.EVENTS_PAGE || archive,
                width: 85,
                render: (event) => (
                  <Group spacing="xs" noWrap>
                    <ActionIcon
                      variant="transparent"
                      size="md"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal({
                          title: t("modal.event.edit"),
                          children: <EventForm editedEventId={event.id}/>,
                        });
                      }}
                      sx={theme => ({
                        "&:hover": {
                          color: theme.fn.themeColor(theme.primaryColor),
                        },
                      })}
                    >
                      <Pencil/>
                    </ActionIcon>
                    <ActionIcon
                      variant="transparent"
                      size="md"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        onDeleteClick(event);
                      }}
                      sx={theme => ({
                        "&:hover": {
                          color: theme.colors.red[6],
                        },
                      })}
                    >
                      <Trash/>
                    </ActionIcon>
                  </Group>
                ),
              },
            ]}
          />
        </Box>
      </QueryComponent>
    </Stack>
  );
};

export default EventTable;
