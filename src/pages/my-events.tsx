import {ActionIcon, Affix, Group, Stack, Table} from "@mantine/core";
import React, {useState} from "react";
import {QueryComponent} from "../components/QueryComponent";
import {CreateEventDialog} from "../components/event/CreateEventDialog";
import {useRouter} from "next/router";
import {EditEventDialog} from "../components/event/EditEventDialog";
import {getIntervalString} from "../utils/utilFunctions";
import {FilterEventsComponent} from "../components/event/FilterEventsComponent";
import {ConfirmDialog} from "../components/ConfirmDialog";
import {EventType} from "../models/Event";
import {Pencil, Plus, Trash} from "tabler-icons-react";
import {api} from "../utils/api";

export default function MyEventsPage() {
  const [filteredList, setFilteredList] = useState<EventType[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const router = useRouter();

  const eventsQuery = api.event.getAllCreated.useQuery();
  const deleteEvent = api.event.delete.useMutation();

  return (
    <>
      <Stack>
        <FilterEventsComponent
          events={eventsQuery.data ?? []}
          setFilteredEvents={setFilteredList}
          filterKey="MyEventsPageFilter"
        />
        <QueryComponent resourceName={"My Events"} query={eventsQuery}>
          <Table highlightOnHover>
            <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Interval</th>
              <th>Location</th>
              <th>Equipment</th>
              <th>Price</th>
              <th>Limit</th>
              <th></th>
              {/* <th>Recurring</th> */}
            </tr>
            </thead>
            <tbody>
            {filteredList.map((event) => (
              <tr
                key={event.id}
                onClick={() => router.replace(`events/${event.id}`)}
                style={{cursor: "pointer"}}
              >
                <td>{event.name}</td>
                <td>{new Date(event.start).toLocaleDateString()}</td>
                <td>{getIntervalString(event.start, event.end)}</td>
                {/*<td>{event.location.address}</td>*/}
                <td>{event.equipment}</td>
                <td>{event.price && <>$ {event.price}</>}</td>
                {/*TODO JavaScript formatter (refactor everywhere)*/}
                <td>{event.limit}</td>
                {/* <td>{event.recurring.toString()}</td> */}
                <td>
                  <Group spacing="xs">
                    <ActionIcon
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
      <Affix position={{bottom: 20, right: 20}}>
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
