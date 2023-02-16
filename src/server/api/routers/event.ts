import {createTRPCRouter, protectedProcedure} from "../trpc";
import {BasicEventSchema, CreateEventSchema, DetailedEventSchema} from "../../../models/Event";
import {IdSchema} from "../../../models/Id";
import {z} from "zod";

export const eventRouter = createTRPCRouter({
  getAll: protectedProcedure
    .output(BasicEventSchema.array())
    .query(async ({ctx}) => {
      const events = await ctx.prisma.event.findMany();
      return BasicEventSchema.array().parse(events);
    }),
  getAllCreated: protectedProcedure
    .output(BasicEventSchema.array())
    .query(async ({ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const caller = await prisma.user.findFirst({
        where: {id: callerId},
        include: {createdEvents: true}
      });

      if (!caller) return [];

      return BasicEventSchema.array().parse(caller.createdEvents);
    }),
  getFeed: protectedProcedure
    .output(BasicEventSchema.array())
    .query(async ({ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const events = await prisma.event.findMany({
        where: {
          creatorId: {
            not: callerId
          }
        },
        include: {creator: true, participants: true}
      });

      return BasicEventSchema.array().parse(events);
    }),
  getCalendar: protectedProcedure
    .output(BasicEventSchema.array())
    .query(async ({ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const caller = await prisma.user.findFirst({
        where: {id: callerId},
        include: {
          createdEvents: true,
          participatedEvents: true
        }
      });

      if (!caller) return [];

      return BasicEventSchema.array().parse([...caller.createdEvents, ...caller.participatedEvents]);
    }),
  getById: protectedProcedure
    .input(IdSchema)
    .output(DetailedEventSchema)
    .query(async ({input: id, ctx}) => {
      const event = await ctx.prisma.event.findFirst({
        where: {id},
        include: {creator: true, participants: true}
      });

      return DetailedEventSchema.parse(event);
    }),

  create: protectedProcedure
    .input(CreateEventSchema)
    .output(BasicEventSchema)
    .mutation(async ({input: createEvent, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const event = await prisma.event.create({
        data: {
          ...createEvent,
          creatorId: callerId
        },
      });

      return BasicEventSchema.parse(event);
    }),
  // TODO participate: protectedProcedure.input().output().mutation(),
  //  is this needed? maybe use update endpoint?
  update: protectedProcedure
    .input(CreateEventSchema.extend({id: IdSchema}))
    .output(BasicEventSchema)
    .mutation(async ({input: createEvent, ctx}) => {
      const updatedEvent = await ctx.prisma.event.update({
        where: {id: createEvent.id},
        data: createEvent,
      });
      return BasicEventSchema.parse(updatedEvent);
    }),
  delete: protectedProcedure
    .input(IdSchema)
    .output(z.boolean())
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const {count} = await prisma.event.deleteMany({
        where: {
          id: input,
          creatorId: callerId
        }
      });

      return !!count;
    }),
});
