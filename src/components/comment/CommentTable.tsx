import {ActionIcon, Box, Group, MantineNumberSize, Stack, Text, TextInput, useMantineTheme} from "@mantine/core";
import {openConfirmModal, openModal} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {DataTable, DataTableSortStatus} from "mantine-datatable";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";
import {FunctionComponent, useEffect, useState} from "react";
import {Pencil, Trash} from "tabler-icons-react";
import {api} from "../../utils/api";
import {getLongDateFormatter} from "../../utils/formatters";
import {PAGE_SIZES} from "../event/EventTable";
import {QueryComponent} from "../QueryComponent";
import {DetailedCommentType} from "../../models/Comment";
import {CommentForm} from "./CommentForm";
import Link from "next/link";
import {RichTextDisplay} from "../rich-text/RichTextDisplay";
import {IconSearch} from "@tabler/icons";
import {useDebouncedValue} from "@mantine/hooks";
import {SortDirection} from "../../models/event/PaginateEvents";
import {SortCommentByProperty} from "../../server/api/routers/comment";

const CommentTable: FunctionComponent = () => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES.at(0) as number);
  const [sortBy, setSortBy] = useState<DataTableSortStatus>({columnAccessor: "postedAt", direction: "desc"});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);

  const theme = useMantineTheme();
  const {locale} = useRouter();
  const {t} = useTranslation("common");
  const longDateFormatter = getLongDateFormatter(locale as string);

  const commentsQuery = api.comment.getAllCreated.useQuery({
    page,
    pageSize,
    searchQuery: debouncedSearchQuery,
    sortBy: {
      property: sortBy.columnAccessor as SortCommentByProperty,
      direction: sortBy.direction as SortDirection,
    },
  });
  const deleteComment = api.comment.delete.useMutation({
    onSuccess: () => commentsQuery.refetch().then(() =>
      showNotification({
        color: "green",
        title: t("notification.comment.delete.title"),
        message: t("notification.comment.delete.message"),
      })),
  });

  useEffect(() => {
    if (commentsQuery.data?.comments.length === 0 && page !== 1) {
      setPage(page - 1);
    }
  }, [commentsQuery.data, page]);

  const onDeleteClick = (comment: DetailedCommentType) => openConfirmModal({
    title: t("modal.comment.delete.title"),
    children: (
      <Stack>
        <Text>
          {t("modal.comment.delete.message")}
        </Text>
        <Text weight="bold">
          "{comment.message}"
        </Text>
      </Stack>
    ),
    labels: {confirm: t("button.confirm"), cancel: t("button.cancel")},
    onConfirm: () => deleteComment.mutate(comment.id),
  });

  return (
    <Stack sx={{height: "100%"}}>
      <TextInput
        icon={<IconSearch/>}
        placeholder={t("filterEvents.search") as string}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
      />
      <QueryComponent resourceName={t("resource.comments")} query={commentsQuery}>
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
            noRecordsText={t("commentTable.noRecords") as string}
            sortStatus={sortBy}
            onSortStatusChange={setSortBy}
            page={page}
            onPageChange={setPage}
            recordsPerPageOptions={PAGE_SIZES}
            recordsPerPageLabel={t("commentTable.recordsPerPage") as string}
            recordsPerPage={pageSize}
            onRecordsPerPageChange={(newPageSize) => {
              setPageSize(newPageSize);
              setPage(1);
            }}
            records={commentsQuery.data?.comments}
            totalRecords={commentsQuery.data?.size}
            columns={[
              {
                accessor: "message",
                title: t("commentTable.message"),
                sortable: true,
                width: 300,
                render: ({message}) => (<RichTextDisplay richText={message} maxHeight={25}/>),
              },
              {
                accessor: "postedAt",
                title: t("commentTable.postedAt"),
                sortable: true,
                render: ({postedAt}) => longDateFormatter.format(postedAt),
              },
              {
                accessor: "event",
                title: t("commentTable.event"),
                sortable: true,
                render: ({event}) => (
                  <Link
                    href={`/events/${event.id}`}
                    locale={locale}
                    passHref
                  >
                    {event.name}
                  </Link>
                ),
              },
              {
                accessor: "actions",
                title: t("myEvents.actions"),
                width: 85,
                render: (comment) => (
                  <Group spacing="xs" noWrap>
                    <ActionIcon
                      variant="transparent"
                      size="md"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal({
                          title: t("modal.comment.edit"),
                          children: <CommentForm eventId={comment.event.id} editedComment={comment}/>,
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
                        onDeleteClick(comment);
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

export default CommentTable;
