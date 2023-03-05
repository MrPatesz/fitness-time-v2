import {ActionIcon, Affix, Flex, Group, Stack, Table, Text, useMantineTheme} from "@mantine/core";
import {openConfirmModal, openModal} from "@mantine/modals";
import {showNotification} from "@mantine/notifications";
import {useRouter} from "next/router";
import {useState} from "react";
import {Pencil, Plus, Trash} from "tabler-icons-react";
import {EventForm} from "../components/event/EventForm";
import {FilterEventsComponent} from "../components/event/FilterEventsComponent";
import {QueryComponent} from "../components/QueryComponent";
import {BasicEventType} from "../models/Event";
import {api} from "../utils/api";
import {dateFormatter, priceFormatter} from "../utils/formatters";

export default function MyEventsPage() {
  const [filteredList, setFilteredList] = useState<BasicEventType[]>([]);

  const router = useRouter();
  const theme = useMantineTheme();

  const queryContext = api.useContext();
  const eventsQuery = api.event.getAllCreated.useQuery();
  const deleteEvent = api.event.delete.useMutation({
    onSuccess: () => queryContext.event.invalidate().then(() =>
      showNotification({
        color: "green",
        title: "Deleted event!",
        message: "The event has been deleted.",
      })),
  });

  const onDeleteClick = (event: BasicEventType) => openConfirmModal({
    title: "Delete",
    children: (
      <Flex>
        <Text>
          Are you sure you want to delete this event:
        </Text>
        <Text weight="bold">
          &nbsp;{event.name}
        </Text>
        <Text>
          ?
        </Text>
      </Flex>
    ),
    labels: {confirm: "Confirm", cancel: "Cancel"},
    onConfirm: () => deleteEvent.mutate(event.id),
    zIndex: 401,
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
              <th>Date and Time</th>
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
                onClick={() => router.push(`events/${event.id}`)}
                style={{cursor: "pointer"}}
              >
                <td>{event.name}</td>
                <td>{dateFormatter.formatRange(event.start, event.end)}</td>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal({
                          title: "Edit Event",
                          zIndex: 401,
                          closeOnClickOutside: false,
                          children: <EventForm editedEventId={event.id}/>,
                        });
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
          variant="filled"
          size="xl"
          onClick={() => openModal({
            title: "Create Event",
            zIndex: 401,
            closeOnClickOutside: false,
            children: <EventForm/>,
          })}
        >
          <Plus/>
        </ActionIcon>
      </Affix>
    </>
  );
}
