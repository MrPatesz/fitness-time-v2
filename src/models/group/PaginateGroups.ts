import {z} from "zod";
import {PaginateBaseSchema, SortDirection} from "../PaginateBase";

export enum SortGroupByProperty {
  NAME = "name",
  CREATED_AT = "createdAt",
  // MEMBER_COUNT = "memberCount",
}

export const PaginateGroupsSchema = PaginateBaseSchema.extend({
  sortBy: z.object({
    property: z.nativeEnum(SortGroupByProperty),
    direction: z.nativeEnum(SortDirection),
  }),
  createdOnly: z.boolean(),
});

export type PaginateGroupsType = z.infer<typeof PaginateGroupsSchema>;
