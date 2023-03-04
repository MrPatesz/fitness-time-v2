import {ActionIcon, Group, MultiSelect, Select, TextInput,} from "@mantine/core";
import {useLocalStorage} from "@mantine/hooks";
import {FunctionComponent, useEffect, useState} from "react";
import {ArrowDown, ArrowUp, Search} from "tabler-icons-react";
import {BasicEventType} from "../../models/Event";

enum OrderBy {
  NAME = "name",
  DATE = "date",
  LOCATION = "location",
  PRICE = "price",
}

const orderByValues = [
  {value: OrderBy.NAME, label: "Name"},
  {value: OrderBy.DATE, label: "Date"},
  {value: OrderBy.LOCATION, label: "Location"},
  {value: OrderBy.PRICE, label: "Price"},
];

enum FilterBy {
  FREE = "free",
  NO_EQUIPMENT = "no_equipment",
  LIMITED = "limited",
}

const filterValues = [
  {value: FilterBy.FREE, label: "Free"},
  {value: FilterBy.NO_EQUIPMENT, label: "No Equipment"},
  {value: FilterBy.LIMITED, label: "Limited"},
];

export const FilterEventsComponent: FunctionComponent<{
  filterKey: string;
  events: BasicEventType[];
  setFilteredEvents: (filteredList: BasicEventType[]) => void;
}> = ({filterKey, events, setFilteredEvents}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [tags, setTags] = useLocalStorage<string[]>({
    key: filterKey,
    defaultValue: [],
  });
  const [orderBy, setOrderBy] = useState<OrderBy>(OrderBy.DATE);
  const [ascending, setAscending] = useState<boolean>(false);

  useEffect(() => {
    setFilteredEvents(
      events
        ?.filter((a) => {
          const free = !a.price;
          const noEquipment = !a.equipment;
          const limited = !!a.limit;

          return (
            (!tags.includes(FilterBy.FREE) || free) &&
            (!tags.includes(FilterBy.NO_EQUIPMENT) || noEquipment) &&
            (!tags.includes(FilterBy.LIMITED) || limited)
          );
        })
        ?.filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
        ?.sort((a, b) => {
          let result = 0;
          switch (orderBy) {
            case OrderBy.NAME: {
              result = a.name.localeCompare(b.name);
              break;
            }
            case OrderBy.DATE: {
              result = new Date(a.start).getTime() - new Date(b.start).getTime();
              break;
            }
            case OrderBy.LOCATION: {
              result = a.location.address.localeCompare(b.location.address);
              break;
            }
            case OrderBy.PRICE: {
              result = (a.price ?? 0) - (b.price ?? 0);
              break;
            }
          }
          if (!ascending) {
            result *= -1;
          }
          return result;
        })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, searchTerm, tags, orderBy, ascending]);

  return (
    <Group align="end" position="apart">
      <TextInput
        sx={{width: "300px"}}
        label="Search by Name"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.currentTarget.value)}
        icon={<Search/>}
      />
      <MultiSelect
        sx={{minWidth: "300px", maxWidth: "320px"}}
        data={filterValues}
        label="Filter by Attributes"
        value={tags}
        onChange={setTags}
      />
      <Select
        rightSection={
          <ActionIcon onClick={() => setAscending(!ascending)}>
            {ascending ? <ArrowUp/> : <ArrowDown/>}
          </ActionIcon>
        }
        sx={{width: "300px"}}
        data={orderByValues}
        label="Order by"
        value={orderBy}
        onChange={(event) => {
          if (event) {
            setOrderBy(event as OrderBy);
          }
        }}
      />
    </Group>
  );
};
