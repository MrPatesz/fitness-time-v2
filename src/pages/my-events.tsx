import {ActionIcon, Affix, Group, Stack, Table, useMantineTheme} from "@mantine/core";
import {useRouter} from "next/router";
import React, {useState} from "react";
import {Pencil, Plus, Trash} from "tabler-icons-react";
import {ConfirmDialog} from "../components/ConfirmDialog";
import {CreateEventDialog} from "../components/event/CreateEventDialog";
import {EditEventDialog} from "../components/event/EditEventDialog";
import {FilterEventsComponent} from "../components/event/FilterEventsComponent";
import {QueryComponent} from "../components/QueryComponent";
import {BasicEventType} from "../models/Event";
import {api} from "../utils/api";
import {getIntervalString} from "../utils/utilFunctions";
import {priceFormatter} from "../utils/formatters";

export default function MyEventsPage() {
  const [filteredList, setFilteredList] = useState<BasicEventType[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const router = useRouter();
  const theme = useMantineTheme();

  const queryContext = api.useContext();
  const eventsQuery = api.event.getAllCreated.useQuery();
  const deleteEvent = api.event.delete.useMutation({
    onSuccess: () => queryContext.event.invalidate(),
  });

  return (
    <>
      <Stack>
        <FilterEventsComponent
          events={eventsQuery.data ?? []}
          setFilteredEvents={setFilteredList}
          filterKey="MyEventsPageFilter"
        />
        <QueryComponent resourceName={"My Events"} query={eventsQuery}>
          <Table highlightOnHover withBorder withColumnBorders>
            <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Interval</th>
              <th>Location</th>
              <th>Equipment</th>
              <th>Price</th>
              <th>Limit</th>
              {/* <th>Recurring</th> */}
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {filteredList.map((event) => (
              <tr
                key={event.id}
                onClick={() => {
                  if (!editId) {
                    router.replace(`events/${event.id}`);
                  }
                }}
                style={{cursor: "pointer"}}
              >
                <td>{event.name}</td>
                <td>{new Date(event.start).toLocaleDateString()}</td>
                <td>{getIntervalString(event.start, event.end)}</td>
                <td>{event.location.address}</td>
                <td>{event.equipment}</td>
                <td>{event.price && priceFormatter.format(event.price)}</td>
                <td>{event.limit}</td>
                {/* <td>{event.recurring.toString()}</td> */}
                <td>
                  <Group spacing="xs">
                    <ActionIcon
                      // disabled={event.isArchive}
                      variant="filled"
                      size="md"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        setEditId(event.id);
                      }}
                    >
                      <Pencil/>
                    </ActionIcon>
                    <ActionIcon
                      // disabled={event.isArchive}
                      variant="filled"
                      size="md"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        setDeleteId(event.id);
                      }}
                    >
                      <Trash/>
                    </ActionIcon>
                    <EditEventDialog
                      open={editId === event.id}
                      onClose={() => setEditId(null)}
                      eventId={event.id}
                    />
                    <ConfirmDialog
                      title={`Are you sure you want to delete this event: ${event.name}?`}
                      open={deleteId === event.id}
                      onClose={() => setDeleteId(null)}
                      onConfirm={() => deleteEvent.mutate(event.id)}
                    />
                  </Group>
                </td>
              </tr>
            ))}
            </tbody>
          </Table>
        </QueryComponent>
      </Stack>
      <CreateEventDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
      />
      <Affix position={{bottom: theme.spacing.md, right: theme.spacing.md}}>
        <ActionIcon
          variant="filled"
          size="xl"
          onClick={() => setOpenCreate(true)}
        >
          <Plus/>
        </ActionIcon>
      </Affix>
    </>
  );
}
