import {z} from "zod";

export enum SortEventByProperty {
  NAME = "name",
  START = "start",
  PRICE = "price",
  LIMIT = "limit",
}

export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

export const PaginateEventsSchema = z.object({
  page: z.number().min(1),
  pageSize: z.number().min(5).max(50),
  sortBy: z.object({
    property: z.nativeEnum(SortEventByProperty),
    direction: z.nativeEnum(SortDirection),
  }),
  archive: z.boolean(),
  createdOnly: z.boolean(),
  searchQuery: z.string(),
});

export type PaginateEventsType = z.infer<typeof PaginateEventsSchema>;