import {ActionIcon, Box, Checkbox, Group, MantineNumberSize, Stack, TextInput, useMantineTheme} from "@mantine/core";
import {useDebouncedValue} from "@mantine/hooks";
import {openModal} from "@mantine/modals";
import {IconSearch} from "@tabler/icons";
import {DataTable, DataTableSortStatus} from "mantine-datatable";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";
import {useState} from "react";
import {Plus} from "tabler-icons-react";
import i18nConfig from "../../../next-i18next.config.mjs";
import {EventForm} from "../../components/event/EventForm";
import {QueryComponent} from "../../components/QueryComponent";
import {SortEventByProperty} from "../../models/PaginateEvents";
import {api} from "../../utils/api";
import {getLongDateFormatter, getPriceFormatter} from "../../utils/formatters";

const DATE_TIME: string = "dateTime";
const PAGE_SIZES: number[] = [10, 25, 50];

export default function EventsPage() {
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
      direction: sortBy.direction,
    },
    searchQuery: debouncedSearchQuery,
    createdOnly: false,
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
        <Box sx={{maxHeight: "calc(100vh - (72px + 36px + 16px + 16px))" /*TODO*/}}>
          <DataTable
            highlightOnHover
            withBorder
            withColumnBorders
            textSelectionDisabled
            borderRadius={theme.defaultRadius as MantineNumberSize}
            minHeight={!eventsQuery.data?.events.length ? 175 : undefined}
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
            onRowClick={(event) => pushRoute(`events/${event.id}`, undefined, {locale})}
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
            ]}
          />
        </Box>
      </QueryComponent>
    </Stack>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});