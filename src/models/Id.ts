import {z} from "zod";

export const IdSchema = z.number().min(1);