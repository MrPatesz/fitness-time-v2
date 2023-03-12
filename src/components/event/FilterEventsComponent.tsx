import {ActionIcon, Group, MultiSelect, Select, TextInput,} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {Dispatch, FunctionComponent, SetStateAction} from "react";
import {ArrowDown, ArrowUp, Search} from "tabler-icons-react";
import {EventFilters} from "../../pages/feed";

export enum OrderBy {
  NAME = "name",
  DATE = "date",
  LOCATION = "location",
  PRICE = "price",
}

export enum FilterBy {
  FREE = "free",
  LIMITED = "limited",
}

export const FilterEventsComponent: FunctionComponent<{
  filters: EventFilters;
  setFilters: Dispatch<SetStateAction<EventFilters>>;
}> = ({filters, setFilters}) => {
  const {t} = useTranslation("common");

  return (
    <Group align="end" position="apart">
      <TextInput
        sx={{width: "300px"}}
        label={t("filterEvents.search")}
        value={filters.searchTerm}
        onChange={(event) => setFilters({...filters, searchTerm: event.currentTarget.value})}
        icon={<Search/>}
      />
      <MultiSelect
        sx={{minWidth: "300px", maxWidth: "320px"}}
        data={[
          {value: FilterBy.FREE, label: t("common.free") as string},
          {value: FilterBy.LIMITED, label: t("filterEvents.limited") as string},
        ]}
        label={t("filterEvents.filter")}
        value={filters.tags}
        onChange={(tags) => setFilters({...filters, tags: (tags as FilterBy[])})}
      />
      <Select
        rightSection={
          <ActionIcon onClick={() => setFilters({...filters, ascending: !filters.ascending})}>
            {filters.ascending ? <ArrowUp/> : <ArrowDown/>}
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
        value={filters.orderBy}
        onChange={(event) => {
          if (event) {
            setFilters({...filters, orderBy: (event as OrderBy)});
          }
        }}
      />
    </Group>
  );
};
