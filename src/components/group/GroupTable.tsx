import {ActionIcon, Box, Flex, Group, MantineNumberSize, Stack, Text, TextInput, useMantineTheme} from '@mantine/core';
import {useDebouncedValue} from '@mantine/hooks';
import {openConfirmModal, openModal} from '@mantine/modals';
import {showNotification} from '@mantine/notifications';
import {IconSearch} from '@tabler/icons';
import {DataTable, DataTableSortStatus} from 'mantine-datatable';
import {useTranslation} from 'next-i18next';
import {FunctionComponent, useEffect, useState} from 'react';
import {Pencil, Plus, Trash} from 'tabler-icons-react';
import {BasicGroupType} from '../../models/Group';
import {api} from '../../utils/api';
import {GroupTableDisplayPlace, InvalidateEvent, SortDirection, SortGroupByProperty} from '../../utils/enums';
import {useLongDateFormatter} from '../../utils/formatters';
import {PAGE_SIZES} from '../event/EventTable';
import {QueryComponent} from '../QueryComponent';
import {CreateGroupForm} from './CreateGroupForm';
import {EditGroupForm} from './EditGroupForm';
import {useMyRouter} from '../../hooks/useMyRouter';

const GroupTable: FunctionComponent<{
  groupTableDisplayPlace: GroupTableDisplayPlace;
}> = ({groupTableDisplayPlace}) => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES.at(0) as number);
  const [sortBy, setSortBy] = useState<DataTableSortStatus>({columnAccessor: 'createdAt', direction: 'desc'});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);

  const theme = useMantineTheme();
  const {locale, pushRoute} = useMyRouter();
  const {t} = useTranslation('common');
  const longDateFormatter = useLongDateFormatter();

  const groupsQuery = api.group.getPaginatedGroups.useQuery({
    page,
    pageSize,
    sortBy: {
      property: sortBy.columnAccessor as SortGroupByProperty,
      direction: sortBy.direction as SortDirection,
    },
    searchQuery: debouncedSearchQuery,
    createdOnly: groupTableDisplayPlace === GroupTableDisplayPlace.CONTROL_PANEL,
  });
  const deleteGroup = api.group.delete.useMutation({
    onSuccess: () => showNotification({
      color: 'green',
      title: t('notification.group.delete.title'),
      message: t('notification.group.delete.message'),
    }),
  });

  useEffect(() => {
    if (groupsQuery.data?.groups.length === 0 && page !== 1) {
      setPage(page - 1);
    }
  }, [groupsQuery.data, page]);

  const onDeleteClick = (group: BasicGroupType) => openConfirmModal({
    title: t('modal.group.delete.title'),
    children: (
      <Stack>
        <Text>
          {t('modal.group.delete.message')}
        </Text>
        <Text weight="bold">
          &quot;{group.name}&quot;
        </Text>
      </Stack>
    ),
    labels: {confirm: t('button.confirm'), cancel: t('button.cancel')},
    onConfirm: () => deleteGroup.mutate(group.id),
  });

  return (
    <Stack h="100%">
      <Flex gap="xs">
        <TextInput
          sx={{flexGrow: 1}}
          icon={<IconSearch/>}
          placeholder={t('filterEvents.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
        <ActionIcon
          title={t('modal.group.create')}
          size={36}
          variant="filled"
          color={theme.fn.themeColor(theme.primaryColor)}
          onClick={() => openModal({
            title: t('modal.group.create'),
            children: <CreateGroupForm/>,
          })}
        >
          <Plus/>
        </ActionIcon>
      </Flex>
      <QueryComponent
        resourceName={t('resource.groups')}
        query={groupsQuery}
        eventInfo={{event: InvalidateEvent.GroupGetPaginatedGroups}}
        loading={deleteGroup.isLoading}
      >
        <Box
          sx={{
            height: '100%',
            minHeight: 300,
            position: 'relative',
          }}
        >
          <DataTable
            sx={{
              position: 'absolute',
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
            noRecordsText={t('groupTable.noRecords')}
            sortStatus={sortBy}
            onSortStatusChange={setSortBy}
            page={page}
            onPageChange={setPage}
            recordsPerPageOptions={PAGE_SIZES}
            recordsPerPageLabel={t('groupTable.recordsPerPage')}
            recordsPerPage={pageSize}
            onRecordsPerPageChange={(newPageSize) => {
              setPageSize(newPageSize);
              setPage(1);
            }}
            records={groupsQuery.data?.groups}
            totalRecords={groupsQuery.data?.size}
            onRowClick={(group) => void pushRoute(`/groups/${group.id}`, undefined, {locale})}
            columns={[
              {
                accessor: 'name',
                title: t('common.name'),
                sortable: true,
              },
              {
                accessor: 'createdAt',
                title: t('groupTable.createdAt'),
                sortable: true,
                render: ({createdAt}) => longDateFormatter.format(createdAt),
              },
              {
                accessor: 'creatorName',
                title: t('myEvents.creator'),
                hidden: groupTableDisplayPlace === GroupTableDisplayPlace.CONTROL_PANEL,
                render: ({creator}) => creator.name,
              },
              {
                accessor: 'actions',
                title: t('myEvents.actions'),
                hidden: groupTableDisplayPlace === GroupTableDisplayPlace.GROUPS_PAGE,
                width: 85,
                render: (group) => (
                  <Group spacing="xs" noWrap>
                    <ActionIcon
                      title={t('modal.group.edit')}
                      variant="transparent"
                      size="md"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal({
                          title: t('modal.group.edit'),
                          children: <EditGroupForm groupId={group.id}/>,
                        });
                      }}
                      sx={theme => ({
                        '&:hover': {
                          color: theme.fn.themeColor(theme.primaryColor),
                        },
                      })}
                    >
                      <Pencil/>
                    </ActionIcon>
                    <ActionIcon
                      title={t('modal.group.delete.title')}
                      variant="transparent"
                      size="md"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick(group);
                      }}
                      sx={theme => ({
                        '&:hover': {
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

export default GroupTable;
