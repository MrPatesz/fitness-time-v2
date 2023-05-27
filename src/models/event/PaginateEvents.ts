import {z} from "zod";
import {PaginateBaseSchema} from "../PaginateBase";
import {SortDirection, SortEventByProperty} from "../../utils/enums";

export const PaginateEventsSchema = PaginateBaseSchema.extend({
  sortBy: z.object({
    property: z.nativeEnum(SortEventByProperty),
    direction: z.nativeEnum(SortDirection),
  }),
  createdOnly: z.boolean(),
  archive: z.boolean(),
});

export type PaginateEventsType = z.infer<typeof PaginateEventsSchema>;
