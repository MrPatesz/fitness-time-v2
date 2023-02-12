import {createTRPCRouter, protectedProcedure} from "../trpc";
import {CreateEventSchema} from "../../../models/Event";
import {IdSchema} from "../../../models/Id";

export const eventRouter = createTRPCRouter({
  getAll: protectedProcedure.query(() => {
  }),
  getOwned: protectedProcedure.query(() => {
  }),
  getFeed: protectedProcedure.query(() => {
  }),
  getCalendar: protectedProcedure.query(() => {
  }),
  getById: protectedProcedure
    .input(IdSchema)
    // .output(EventSchema)
    .query(({input: _input, ctx: _ctx}) => {
      // return ctx.prisma.event.findFirst({
      //     where: {
      //         id: input
      //     }
      // })
    }),

  create: protectedProcedure
    .input(CreateEventSchema)
    // .output(EventSchema)
    .mutation(({input: _input}) => {
    }),
  // participate: protectedProcedure.input().mutation(),
  // update: protectedProcedure.input().mutation(),
  delete: protectedProcedure.input(IdSchema).mutation(({input: _input, ctx: _ctx}) => {
    // return ctx.prisma.event.delete({
    //     where: {
    //         id: input
    //     }
    // })
  }),
});
