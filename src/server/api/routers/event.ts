import {TRPCError} from "@trpc/server";
import {z} from "zod";
import {BasicEventSchema, CreateEventSchema, DetailedEventSchema} from "../../../models/event/Event";
import {IdSchema} from "../../../models/Id";
import {PaginateEventsSchema} from "../../../models/event/PaginateEvents";
import {createTRPCRouter, protectedProcedure} from "../trpc";
import {Prisma} from ".prisma/client";

export const eventRouter = createTRPCRouter({
  getPaginatedEvents: protectedProcedure
    .input(PaginateEventsSchema)
    .output(z.object({events: BasicEventSchema.array(), size: z.number()}))
    .query(async ({
                    input: {page, pageSize, sortBy, archive, createdOnly, searchQuery},
                    ctx: {session: {user: {id: callerId}}, prisma}
                  }) => {
      const orderBy: {
        name?: Prisma.SortOrder;
        start?: Prisma.SortOrder;
        price?: Prisma.SortOrder;
        limit?: Prisma.SortOrder;
      } = {};
      orderBy[sortBy.property] = Prisma.SortOrder[sortBy.direction];

      const where = {
        creatorId: createdOnly ? callerId : undefined,
        start: archive ? {
          lt: new Date(),
        } : {
          gt: new Date(),
        },
        name: {
          mode: "insensitive",
          contains: searchQuery,
        } as Prisma.StringFilter,
      };

      const [events, numberOfEvents] = await prisma.$transaction([
        prisma.event.findMany({
          where,
          include: {location: true, creator: true},
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy,
        }),
        prisma.event.count({
          where,
        }),
      ]);

      return {
        events: BasicEventSchema.array().parse(events),
        size: numberOfEvents,
      };
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
        include: {
          creator: true,
          participants: true,
          location: true,
          comments: {include: {user: true}, orderBy: {postedAt: "desc"}}
        },
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
