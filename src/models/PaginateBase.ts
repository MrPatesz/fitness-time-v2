import {z} from "zod";

export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

export const PaginateBaseSchema = z.object({
  page: z.number().min(1),
  pageSize: z.number().min(5).max(50),
  searchQuery: z.string(),
});
