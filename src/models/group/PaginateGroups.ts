import {z} from "zod";
import {SortDirection} from "../event/PaginateEvents";

export enum SortGroupByProperty {
  NAME = "name",
  CREATED_AT = "createdAt",
  // MEMBER_COUNT = "memberCount",
}

export const PaginateGroupsSchema = z.object({
  page: z.number().min(1),
  pageSize: z.number().min(5).max(50),
  sortBy: z.object({
    property: z.nativeEnum(SortGroupByProperty),
    direction: z.nativeEnum(SortDirection),
  }),
  createdOnly: z.boolean(),
  searchQuery: z.string(),
});

export type PaginateGroupsType = z.infer<typeof PaginateGroupsSchema>;