import {useMemo, useState} from "react";
import {FilterBy, OrderBy} from "../components/event/FilterEventsComponent";
import {BasicEventType} from "../models/event/Event";
import {defaultEventFilters} from "../utils/defaultObjects";

export interface EventFilters {
  searchTerm: string;
  orderBy: OrderBy;
  ascending: boolean;
  tags: FilterBy[];
}

const useFilteredEvents = (events: BasicEventType[] | undefined) => {
  const [filters, setFilters] = useState<EventFilters>(defaultEventFilters);
  const filteredList = useMemo(() => {
    if (!events) {
      return [];
    }

    return events.filter((a) => {
      const free = !a.price;
      const limited = Boolean(a.limit);

      return (
        (free || !filters.tags.includes(FilterBy.FREE)) &&
        (limited || !filters.tags.includes(FilterBy.LIMITED))
      );
    })
      ?.filter((a) => a.name.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      ?.sort((a, b) => {
        let result: number = 0;
        switch (filters.orderBy) {
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
        if (!filters.ascending) {
          result *= -1;
        }
        return result;
      });
  }, [events, filters]);

  return {filters, setFilters, filteredList};
};

export default useFilteredEvents;