import {z} from "zod";

export enum SortEventByProperty {
  NAME = "name",
  START = "start",
  PRICE = "price",
  LIMIT = "limit",
}

export const PaginateEventsSchema = z.object({
  page: z.number().min(1),
  pageSize: z.number().min(5).max(100),
  sortBy: z.object({
    property: z.nativeEnum(SortEventByProperty),
    direction: z.enum(["asc", "desc"]),
  }),
  archive: z.boolean(),
  searchQuery: z.string(),
});

export type PaginateEventsType = z.infer<typeof PaginateEventsSchema>;