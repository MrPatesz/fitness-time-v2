import {z} from "zod";
import {BasicEventSchema, CreateEventSchema, DetailedEventSchema} from "../../../models/Event";
import {IdSchema} from "../../../models/Id";
import {createTRPCRouter, protectedProcedure} from "../trpc";
import {Prisma} from ".prisma/client";
import {TRPCError} from "@trpc/server";

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
      const caller = await prisma.user.findUnique({
        where: {id: callerId},
        include: {createdEvents: {include: {location: true, creator: true}}},
      });

      if (!caller) {
        throw new TRPCError({code: "UNAUTHORIZED", message: "User doesn't exist!"});
      }

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
      const caller = await prisma.user.findUnique({
        where: {id: callerId},
        include: {
          createdEvents: {include: {location: true, creator: true}},
          participatedEvents: {include: {location: true, creator: true}},
        },
      });

      if (!caller) {
        throw new TRPCError({code: "UNAUTHORIZED", message: "User doesn't exist!"});
      }

      return BasicEventSchema.array().parse([...caller.createdEvents, ...caller.participatedEvents]);
    }),
  getById: protectedProcedure
    .input(IdSchema)
    .output(DetailedEventSchema)
    .query(async ({input: id, ctx}) => {
      const event = await ctx.prisma.event.findUnique({
        where: {id},
        include: {creator: true, participants: true, location: true},
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
                address: createEvent.location.address,
              },
              create: createEvent.location,
            },
          },
        },
        include: {location: true, creator: true},
      });

      return BasicEventSchema.parse(event);
    }),
  participate: protectedProcedure
    .input(z.object({id: IdSchema, participate: z.boolean()}))
    .output(BasicEventSchema)
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const event = await prisma.event.findUnique({
        where: {id: input.id},
        include: {participants: true},
      });

      if (event?.limit && (event.participants.length >= event.limit)) {
        throw new TRPCError({code: "BAD_REQUEST", message: "Event is already full!"});
      }

      const result = await prisma.event.update({
        where: {id: input.id},
        data: {
          participants: input.participate ? {
            connect: {id: callerId},
          } : {
            disconnect: {id: callerId},
          },
        },
        include: {creator: true, location: true},
      });

      return BasicEventSchema.parse(result);
    }),
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
                address: input.event.location.address,
              },
              create: input.event.location,
            },
          },
        },
        include: {location: true, creator: true},
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
          creatorId: callerId,
        },
      });

      return !!count;
    }),
});
