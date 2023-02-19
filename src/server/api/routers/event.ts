import {z} from "zod";
import {BasicEventSchema, CreateEventSchema, DetailedEventSchema} from "../../../models/Event";
import {IdSchema} from "../../../models/Id";
import {createTRPCRouter, protectedProcedure} from "../trpc";
import {Prisma} from ".prisma/client";

export const eventRouter = createTRPCRouter({
  getAll: protectedProcedure
    .output(BasicEventSchema.array())
    .query(async ({ctx}) => {
      const events = await ctx.prisma.event.findMany({
        orderBy: {name: Prisma.SortOrder.asc},
        include: {location: true, creator: true},
      });
      return BasicEventSchema.array().parse(events);
    }),
  getAllCreated: protectedProcedure
    .output(BasicEventSchema.array())
    .query(async ({ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const caller = await prisma.user.findFirst({
        where: {id: callerId},
        include: {createdEvents: {include: {location: true, creator: true}}},
      });

      if (!caller) return [];

      return BasicEventSchema.array().parse(caller.createdEvents);
    }),
  getFeed: protectedProcedure
    .output(BasicEventSchema.array())
    .query(async ({ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const events = await prisma.event.findMany({
        where: {creatorId: {not: callerId}},
        orderBy: {start: Prisma.SortOrder.desc},
        include: {location: true, creator: true},
      });

      return BasicEventSchema.array().parse(events);
    }),
  getCalendar: protectedProcedure
    .output(BasicEventSchema.array())
    .query(async ({ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const caller = await prisma.user.findFirst({
        where: {id: callerId},
        include: {
          createdEvents: {include: {location: true, creator: true}},
          participatedEvents: {include: {location: true, creator: true}},
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
        include: {creator: true, participants: true, location: true}
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
          creator: {connect: {id: callerId}},
          location: {
            connectOrCreate: {
              where: {
                address: createEvent.location.address
              },
              create: createEvent.location
            }
          }
        },
        include: {location: true, creator: true}
      });

      return BasicEventSchema.parse(event);
    }),
  // TODO participate: protectedProcedure.input().output().mutation(),
  //  is this needed? maybe use update endpoint?
  update: protectedProcedure
    .input(z.object({event: CreateEventSchema, id: IdSchema}))
    .output(BasicEventSchema)
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const updatedEvent = await prisma.event.update({
        where: {id: input.id},
        data: {
          ...input.event,
          creator: {connect: {id: callerId}},
          location: {
            connectOrCreate: {
              where: {
                address: input.event.location.address
              },
              create: input.event.location
            }
          }
        },
        include: {location: true, creator: true}
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
