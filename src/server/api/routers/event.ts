import {TRPCError} from "@trpc/server";
import {z} from "zod";
import {BasicEventSchema, CreateEventSchema, DetailedEventSchema,} from "../../../models/Event";
import {PaginateEventsSchema} from "../../../models/pagination/PaginateEvents";
import {IdSchema} from "../../../models/Id";
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
      orderBy[sortBy.property] = sortBy.direction;

      const where = {
        creatorId: createdOnly ? callerId : undefined,
        OR: createdOnly ? undefined : [
          {groupId: null},
          {group: {members: {some: {id: callerId}}}},
        ],
        start: archive ? {
          lt: new Date(),
        } : {
          gt: new Date(),
        },
        name: searchQuery ? ({
          mode: "insensitive",
          contains: searchQuery,
        } as Prisma.StringFilter) : undefined,
      };

      const [events, numberOfEvents] = await prisma.$transaction([
        prisma.event.findMany({
          where,
          include: {location: true, creator: true, group: {include: {creator: true}}},
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
    .input(z.object({
      cursor: z.date().nullish(),
      groupId: IdSchema.nullish(),
      maxDistance: z.number().min(0).optional(),
    }))
    .output(z.object({
      events: BasicEventSchema.array(),
      nextCursor: z.date().nullish(),
    }))
    .query(async ({input: {cursor, groupId, maxDistance}, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const limit = 10;

      const events = await prisma.event.findMany({
        where: groupId ? {groupId} : {
          creatorId: {not: callerId},
          OR: [
            {groupId: null},
            {group: {members: {some: {id: callerId}}}},
          ]
        },
        take: limit + 1,
        cursor: cursor ? {createdAt: cursor} : undefined,
        orderBy: {createdAt: Prisma.SortOrder.desc},
        include: {location: true, creator: true, group: {include: {creator: true}}},
      });

      let nextCursor: Date | undefined = undefined;
      if (events.length > limit) {
        const nextItem = events.pop();
        nextCursor = nextItem?.createdAt;
      }

      const user = await prisma.user.findUnique({where: {id: callerId}});

      if (!user?.locationId) {
        return {
          events: BasicEventSchema.array().parse(events),
          nextCursor,
        };
      }

      // TODO write this whole thing in kysely
      const eventsWithDistance = await Promise.all(events.map(async (e) => {
        const distance: { distanceInKilometers: number }[] = await prisma.$queryRaw`
        SELECT ST_Distance(eventLocation.location, userLocation.location, false)/1000 as "distanceInKilometers"
        FROM (
          (
            SELECT ST_MakePoint(longitude, latitude) as location
            FROM "Event" as e
            JOIN "Location" as l ON e."locationId" = l.id
            WHERE e.id = ${e.id}
          ) as eventLocation
          CROSS JOIN 
          (
            SELECT ST_MakePoint(longitude, latitude) as location
            FROM "User" as u
            JOIN "Location" as l ON u."locationId" = l.id
            WHERE u.id = ${callerId}
          ) as userLocation
        )`;
        return {
          ...e,
          distance: distance.at(0)?.distanceInKilometers,
        };
      }));

      const eventsResult = maxDistance ? eventsWithDistance.filter(e => e.distance === undefined || e.distance < maxDistance) : eventsWithDistance;

      return {
        events: BasicEventSchema.array().parse(eventsResult),
        nextCursor,
      };
    }),
  getCalendar: protectedProcedure
    .output(BasicEventSchema.array())
    .query(async ({ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const caller = await prisma.user.findUnique({
        where: {id: callerId},
        include: {
          participatedEvents: {include: {location: true, creator: true, group: {include: {creator: true}}}},
        },
      });

      if (!caller) {
        throw new TRPCError({code: "UNAUTHORIZED", message: "User doesn't exist!"});
      }

      return BasicEventSchema.array().parse(caller.participatedEvents);
    }),
  getById: protectedProcedure
    .input(IdSchema)
    .output(DetailedEventSchema)
    .query(async ({input: id, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const event = await prisma.event.findUnique({
        where: {id},
        include: {
          creator: true,
          participants: true,
          location: true,
          group: {include: {creator: true}},
          comments: {include: {user: true}, orderBy: {postedAt: "desc"}}
        },
      });

      // TODO write this in kysely
      const distance: { distanceInKilometers: number }[] = await prisma.$queryRaw`
        SELECT ST_Distance(eventLocation.location, userLocation.location, false)/1000 as "distanceInKilometers"
        FROM (
          (
            SELECT ST_MakePoint(longitude, latitude) as location
            FROM "Event" as e
            JOIN "Location" as l ON e."locationId" = l.id
            WHERE e.id = ${id}
          ) as eventLocation
          CROSS JOIN 
          (
            SELECT ST_MakePoint(longitude, latitude) as location
            FROM "User" as u
            JOIN "Location" as l ON u."locationId" = l.id
            WHERE u.id = ${callerId}
          ) as userLocation
        )`;

      return DetailedEventSchema.parse({
        ...event,
        distance: distance.at(0)?.distanceInKilometers,
      });
    }),
  create: protectedProcedure
    .input(CreateEventSchema)
    .output(BasicEventSchema)
    .mutation(async ({input: createEvent, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const event = await prisma.event.create({
        data: {
          ...createEvent,
          groupId: undefined,
          group: createEvent.groupId ? {connect: {id: createEvent.groupId}} : undefined,
          creator: {connect: {id: callerId}},
          participants: {connect: {id: callerId}},
          location: {
            connectOrCreate: {
              where: {
                address: createEvent.location.address,
              },
              create: createEvent.location,
            },
          },
        },
        include: {location: true, creator: true, group: {include: {creator: true}}},
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
        include: {creator: true, location: true, group: {include: {creator: true}}},
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
          groupId: undefined,
          group: input.event.groupId ? {connect: {id: input.event.groupId}} : undefined,
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
        include: {location: true, creator: true, group: {include: {creator: true}}},
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

      return Boolean(count);
    }),
});
