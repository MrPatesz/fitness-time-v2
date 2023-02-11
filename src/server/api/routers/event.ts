import {createTRPCRouter, protectedProcedure, publicProcedure} from "../trpc";
import {EventSchema} from "../../../models/EventType";
import {z} from "zod";
import { IdSchema } from "../../../models/Id";

export const eventRouter = createTRPCRouter({
    getAll: publicProcedure.query(() => {}),
    getOwned: publicProcedure.query(() => {}),
    getFeed: publicProcedure.query(() => {}),
    getCalendar: publicProcedure.query(() => {}),
    getById: publicProcedure.input(IdSchema).query(({input, ctx}) => {
        // return ctx.prisma.event.findFirst({
        //     where: {
        //         id: input
        //     }
        // })
    }),

    create: publicProcedure
        .input(EventSchema)
        .mutation(({ input }) => input),
    // participate: protectedProcedure.input().mutation(),
    // update: protectedProcedure.input().mutation(),
    delete: protectedProcedure.input(IdSchema).mutation(({input, ctx}) => {
        // return ctx.prisma.event.delete({
        //     where: {
        //         id: input
        //     }
        // })
    }),
});
