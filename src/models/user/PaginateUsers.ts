import {z} from "zod";
import {PaginateBaseSchema, SortDirection} from "../PaginateBase";

export const PaginateUsersSchema = PaginateBaseSchema.extend({
  sortBy: z.object({
    direction: z.nativeEnum(SortDirection),
  }),
});

export type PaginateUsersType = z.infer<typeof PaginateUsersSchema>;
