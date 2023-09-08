import {TRPCError} from '@trpc/server';
import {z} from 'zod';
import {
  BasicEventSchema,
  DetailedEventSchema,
  EventWithCreatorSchema,
  EventWithLocationSchema,
  IntervalSchema,
  MutateEventSchema,
} from '../../../models/Event';
import {PaginateEventsSchema} from '../../../models/pagination/PaginateEvents';
import {createTRPCRouter, protectedProcedure} from '../trpc';
import {Prisma} from '.prisma/client';
import {IdSchema} from '../../../models/Utils';
import {InvalidateEvent, PusherChannel} from '../../../utils/enums';
import {PrismaClient} from '@prisma/client';

const getEventDistance = async (eventId: number, userId: string, prisma: PrismaClient) => {
  // TODO write this in kysely
  const distance: { distanceInKilometers: number }[] = await prisma.$queryRaw`
    SELECT ST_Distance(eventLocation.location, userLocation.location, false)/1000 as "distanceInKilometers"
    FROM (
      (
        SELECT ST_MakePoint(longitude, latitude) as location
        FROM "Event" as e
        JOIN "Location" as l ON e."locationId" = l.id
        WHERE e.id = ${eventId}
      ) as eventLocation
      CROSS JOIN 
      (
        SELECT ST_MakePoint(longitude, latitude) as location
        FROM "User" as u
        JOIN "Location" as l ON u."locationId" = l.id
        WHERE u.id = ${userId}
      ) as userLocation
    )
  `;

  return distance.at(0)?.distanceInKilometers;
};

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
          mode: 'insensitive',
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

      const eventsWithDistance = await Promise.all(events.map(async event => ({
        ...event,
        distance: await getEventDistance(event.id, callerId, prisma),
      })));

      const eventsResult = maxDistance ? eventsWithDistance.filter(e => e.distance === undefined || e.distance < maxDistance) : eventsWithDistance;

      return {
        events: BasicEventSchema.array().parse(eventsResult),
        nextCursor,
      };
    }),
  getCalendar: protectedProcedure
    .output(EventWithCreatorSchema.array())
    .query(async ({ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const caller = await prisma.user.findUnique({
        where: {id: callerId},
        include: {
          participatedEvents: {include: {creator: true}},
        },
      });

      return EventWithCreatorSchema.array().parse(caller?.participatedEvents);
    }),
  getParticipatedInInterval: protectedProcedure
    .input(IntervalSchema)
    .output(EventWithLocationSchema.array())
    .query(async ({input: {start, end}, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const caller = await prisma.user.findUnique({
        where: {id: callerId},
        include: {
          participatedEvents: {
            where: {start: {gte: start, lte: end}},
            include: {location: true},
          },
        },
      });

      return EventWithLocationSchema.array().parse(caller?.participatedEvents);
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
        },
      });

      return DetailedEventSchema.parse({
        ...event,
        distance: await getEventDistance(id, callerId, prisma),
      });
    }),
  create: protectedProcedure
    .input(MutateEventSchema)
    .output(z.void())
    .mutation(async ({input: createEvent, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      await prisma.event.create({
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
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetCalendar, callerId);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetFeed, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetPaginatedEvents, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.UserGetById, callerId);
    }),
  participate: protectedProcedure
    .input(z.object({id: IdSchema, participate: z.boolean()}))
    .output(z.void())
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      const event = await prisma.event.findUnique({
        where: {id: input.id},
        include: {participants: true},
      });

      if (event?.limit && (event.participants.length >= event.limit)) {
        throw new TRPCError({code: 'BAD_REQUEST', message: 'Event is already full!'});
      }

      // TODO shall not be able to participate archive event!
      await prisma.event.update({
        where: {id: input.id},
        data: {
          participants: input.participate ? {
            connect: {id: callerId},
          } : {
            disconnect: {id: callerId},
          },
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetById, input.id);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.UserGetById, callerId);
    }),
  update: protectedProcedure
    .input(z.object({event: MutateEventSchema, id: IdSchema}))
    .output(z.void())
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      // TODO shall not be able to edit archive event!
      await prisma.event.update({
        where: {id: input.id, creatorId: callerId},
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
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetById, input.id);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetCalendar, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetFeed, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetPaginatedEvents, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.UserGetById, callerId);
    }),
  delete: protectedProcedure
    .input(IdSchema)
    .output(z.void())
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      // TODO shall not be able to delete archive event!
      await prisma.event.delete({
        where: {
          id: input,
          creatorId: callerId,
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetById, input);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetCalendar, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetFeed, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.EventGetPaginatedEvents, null);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.CommentGetAllByEventId, input);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.UserGetById, callerId);
    }),
});
