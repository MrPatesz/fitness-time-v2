import {z} from "zod";
import {PaginateBaseSchema} from "../PaginateBase";
import {SortDirection, SortGroupByProperty} from "../../utils/enums";

export const PaginateGroupsSchema = PaginateBaseSchema.extend({
  sortBy: z.object({
    property: z.nativeEnum(SortGroupByProperty),
    direction: z.nativeEnum(SortDirection),
  }),
  createdOnly: z.boolean(),
});

export type PaginateGroupsType = z.infer<typeof PaginateGroupsSchema>;
