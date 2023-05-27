import {Box, ColorSwatch, MantineNumberSize, Stack, TextInput, useMantineTheme} from "@mantine/core";
import {useDebouncedValue} from "@mantine/hooks";
import {IconSearch} from "@tabler/icons";
import {DataTable, DataTableSortStatus} from "mantine-datatable";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";
import {FunctionComponent, useEffect, useState} from "react";
import {api} from "../../utils/api";
import {PAGE_SIZES} from "../event/EventTable";
import {QueryComponent} from "../QueryComponent";
import {RichTextDisplay} from "../rich-text/RichTextDisplay";
import UserImage from "./UserImage";
import {SortDirection} from "../../utils/enums";

const UserTable: FunctionComponent = () => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES.at(0) as number);
  const [sortBy, setSortBy] = useState<DataTableSortStatus>({columnAccessor: "name", direction: "asc"});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);

  const theme = useMantineTheme();
  const {push: pushRoute, locale = "en"} = useRouter();
  const {t} = useTranslation("common");

  const usersQuery = api.user.getPaginatedUsers.useQuery({
    page,
    pageSize,
    sortBy: {direction: sortBy.direction as SortDirection},
    searchQuery: debouncedSearchQuery,
  });

  useEffect(() => {
    if (usersQuery.data?.users.length === 0 && page !== 1) {
      setPage(page - 1);
    }
  }, [usersQuery.data, page]);

  return (
    <Stack sx={{height: "100%"}}>
      <TextInput
        sx={{flexGrow: 1}}
        icon={<IconSearch/>}
        placeholder={t("filterEvents.search") as string}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
      />
      <QueryComponent resourceName={t("resource.users")} query={usersQuery}>
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
            noRecordsText={t("userTable.noRecords") as string}
            sortStatus={sortBy}
            onSortStatusChange={setSortBy}
            page={page}
            onPageChange={setPage}
            recordsPerPageOptions={PAGE_SIZES}
            recordsPerPageLabel={t("userTable.recordsPerPage") as string}
            recordsPerPage={pageSize}
            onRecordsPerPageChange={(newPageSize) => {
              setPageSize(newPageSize);
              setPage(1);
            }}
            records={usersQuery.data?.users}
            totalRecords={usersQuery.data?.size}
            onRowClick={(user) => pushRoute(`/users/${user.id}`, undefined, {locale})}
            columns={[
              {
                accessor: "name",
                title: t("common.name"),
                sortable: true,
              },
              {
                accessor: "introduction",
                title: t("profileForm.introduction"),
                render: ({introduction}) => <RichTextDisplay richText={introduction} maxHeight={25}/>,
              },
              {
                accessor: "image",
                title: t("userTable.image"),
                render: (user) => <UserImage user={user} size={25}/>,
              },
              {
                accessor: "themeColor",
                title: t("themeColorPicker.label"),
                render: ({themeColor}) => <ColorSwatch color={theme.fn.themeColor(themeColor)}/>,
              },
            ]}
          />
        </Box>
      </QueryComponent>
    </Stack>
  );
};

export default UserTable;
