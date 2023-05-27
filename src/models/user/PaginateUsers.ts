import {z} from "zod";
import {PaginateBaseSchema} from "../PaginateBase";
import {SortDirection} from "../../utils/enums";

export const PaginateUsersSchema = PaginateBaseSchema.extend({
  sortBy: z.object({
    direction: z.nativeEnum(SortDirection),
  }),
});

export type PaginateUsersType = z.infer<typeof PaginateUsersSchema>;
