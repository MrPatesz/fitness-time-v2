import {ActionIcon, Group, MultiSelect, Select, TextInput,} from "@mantine/core";
import {useLocalStorage} from "@mantine/hooks";
import {useTranslation} from "next-i18next";
import {FunctionComponent, useEffect, useState} from "react";
import {ArrowDown, ArrowUp, Search} from "tabler-icons-react";
import {BasicEventType} from "../../models/Event";

enum OrderBy {
  NAME = "name",
  DATE = "date",
  LOCATION = "location",
  PRICE = "price",
}

enum FilterBy {
  FREE = "free",
  NO_EQUIPMENT = "no_equipment",
  LIMITED = "limited",
}

// TODO refactor: props: setFilters instead of setFilteredList and events (useMemo on FeedPage)
export const FilterEventsComponent: FunctionComponent<{
  filterKey: string;
  events: BasicEventType[];
  setFilteredEvents: (filteredList: BasicEventType[]) => void;
}> = ({filterKey, events, setFilteredEvents}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [orderBy, setOrderBy] = useState<OrderBy>(OrderBy.DATE);
  const [ascending, setAscending] = useState<boolean>(false);
  const [tags, setTags] = useLocalStorage<string[]>({
    key: filterKey,
    defaultValue: [],
  });

  const {t} = useTranslation("common");

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
        label={t("filterEvents.search")}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.currentTarget.value)}
        icon={<Search/>}
      />
      <MultiSelect
        sx={{minWidth: "300px", maxWidth: "320px"}}
        data={[
          {value: FilterBy.FREE, label: t("common.free") as string},
          {value: FilterBy.NO_EQUIPMENT, label: t("filterEvents.noEquipment") as string},
          {value: FilterBy.LIMITED, label: t("filterEvents.limited") as string},
        ]}
        label={t("filterEvents.filter")}
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
        data={[
          {value: OrderBy.NAME, label: t("common.name") as string},
          {value: OrderBy.DATE, label: t("common.date") as string},
          {value: OrderBy.LOCATION, label: t("common.location") as string},
          {value: OrderBy.PRICE, label: t("common.price") as string},
        ]}
        label={t("common.orderBy")}
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
