import {z} from "zod";
import {PaginateBaseSchema, SortDirection} from "../PaginateBase";

export enum SortEventByProperty {
  NAME = "name",
  START = "start",
  PRICE = "price",
  LIMIT = "limit",
}

export const PaginateEventsSchema = PaginateBaseSchema.extend({
  sortBy: z.object({
    property: z.nativeEnum(SortEventByProperty),
    direction: z.nativeEnum(SortDirection),
  }),
  createdOnly: z.boolean(),
  archive: z.boolean(),
});

export type PaginateEventsType = z.infer<typeof PaginateEventsSchema>;
