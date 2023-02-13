import {createTRPCRouter, protectedProcedure} from "../trpc";
import {CreateEventSchema, EventSchema} from "../../../models/Event";
import {IdSchema} from "../../../models/Id";

export const eventRouter = createTRPCRouter({
  getAll: protectedProcedure
    .output(EventSchema.array())
    .query(async ({ctx}) => {
      const events = await ctx.prisma.event.findMany({
        include: {creator: true}
      });

      return EventSchema.array().parse(events);
    }),
  getAllCreated: protectedProcedure
    .output(EventSchema.array())
    .query(async ({ctx}) => {
      const callerId = ctx.session.user.id;

      const caller = await ctx.prisma.user.findFirst({
        where: {id: callerId},
        include: {createdEvents: {include: {creator: true}}}
      });

      if (!caller) return [];

      return EventSchema.array().parse(caller.createdEvents);
    }),
  getFeed: protectedProcedure
    .output(EventSchema.array())
    .query(async ({ctx}) => {
      const callerId = ctx.session.user.id;

      const events = await ctx.prisma.event.findMany({
        where: {
          creatorId: {
            not: callerId
          }
        },
        include: {creator: true, participants: true}
      });

      return EventSchema.array().parse(events);
    }),
  getCalendar: protectedProcedure
    .output(EventSchema.array())
    .query(async ({ctx}) => {
      const callerId = ctx.session.user.id;

      const caller = await ctx.prisma.user.findFirst({
        where: {id: callerId},
        include: {
          createdEvents: {include: {creator: true, participants: true}},
          participatedEvents: {include: {creator: true, participants: true}}
        }
      });

      if (!caller) return [];

      return EventSchema.array().parse([...caller.createdEvents, ...caller.participatedEvents]);
    }),
  getById: protectedProcedure
    .input(IdSchema)
    .output(EventSchema)
    .query(async ({input, ctx}) => {
      const event = await ctx.prisma.event.findFirst({
        where: {id: input},
        include: {creator: true, participants: true}
      });

      return EventSchema.parse(event);
    }),

  create: protectedProcedure
    .input(CreateEventSchema)
    .output(EventSchema)
    .mutation(async ({input, ctx}) => {
      const callerId = ctx.session.user.id;

      const event = await ctx.prisma.event.create({
        data: {
          ...input,
          creatorId: callerId
        },
        include: {
          creator: true,
          participants: true
        },
      });

      return EventSchema.parse(event);
    }),
  // TODO participate: protectedProcedure.input().mutation(),
  update: protectedProcedure
    .input(EventSchema)
    .output(EventSchema)
    .mutation(async ({input, ctx}) => {
      const updatedEvent = await ctx.prisma.event.update({
        where: {
          id: input.id
        },
        data: {
          ...input
        }
      });
      return EventSchema.parse(updatedEvent);
    }),
  delete: protectedProcedure
    .input(IdSchema)
    .mutation(({input, ctx}) => {
      // const callerId = ctx.session.user.id;

      return ctx.prisma.event.delete({
        where: {
          id: input,
          // TODO creatorId: callerId
        }
      })
    }),
});
