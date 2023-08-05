import {z} from 'zod';
import {AverageRatingSchema, BasicRatingSchema, MutateRatingSchema} from '../../../models/Rating';
import {createTRPCRouter, protectedProcedure} from '../trpc';
import {IdSchema} from '../../../models/Utils';
import {InvalidateEvent, PusherChannel} from '../../../utils/enums';

export const ratingRouter = createTRPCRouter({
  getAverageRatingForEvent: protectedProcedure
    .input(IdSchema)
    .output(AverageRatingSchema)
    .query(async ({input: id, ctx: {prisma}}) => {
      const rating = await prisma.rating.aggregate({
        where: {eventId: id},
        _count: {stars: true},
        _avg: {stars: true},
      });

      return {
        count: rating._count.stars,
        averageStars: rating._avg.stars,
      };
    }),
  getAverageRatingForUser: protectedProcedure
    .input(z.string())
    .output(AverageRatingSchema)
    .query(async ({input: userId, ctx: {prisma}}) => {
      const usersEvents = await prisma.event.findMany({
        where: {creatorId: userId},
      });

      const eventIds = usersEvents.map(e => e.id);

      const rating = await prisma.rating.aggregate({
        where: {eventId: {in: eventIds}},
        _count: {stars: true},
        _avg: {stars: true},
      });

      return {
        count: rating._count.stars,
        averageStars: rating._avg.stars,
      };
    }),
  getAverageRatingForGroup: protectedProcedure
    .input(z.number())
    .output(AverageRatingSchema)
    .query(async ({input: groupId, ctx: {prisma}}) => {
      const groupsEvents = await prisma.event.findMany({
        where: {groupId},
      });

      const eventIds = groupsEvents.map(e => e.id);

      const rating = await prisma.rating.aggregate({
        where: {eventId: {in: eventIds}},
        _count: {stars: true},
        _avg: {stars: true},
      });

      return {
        count: rating._count.stars,
        averageStars: rating._avg.stars,
      };
    }),
  getCallerRating: protectedProcedure
    .input(IdSchema)
    .output(BasicRatingSchema.nullish())
    .query(async ({input: eventId, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const findRating = await prisma.rating.findFirst({
        where: {userId: callerId, eventId},
        include: {user: true},
      });

      return BasicRatingSchema.nullish().parse(findRating);
    }),
  rate: protectedProcedure
    .input(z.object({
      createRating: MutateRatingSchema,
      eventId: IdSchema,
    }))
    .output(BasicRatingSchema)
    .mutation(async ({input: {createRating, eventId}, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      const foundRating = await prisma.rating.findFirst({
        where: {userId: callerId, eventId},
        include: {event: true},
      });

      const pusherEvents = () => {
        void pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.RatingGetAverageRatingForEvent, eventId);
        void pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.RatingGetAverageRatingForUser, callerId);
        if (foundRating?.event.groupId) {
          void pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.RatingGetAverageRatingForGroup, foundRating.event.groupId);
        }
      };

      if (!!foundRating) {
        const editedRating = await prisma.rating.update({
          where: {id: foundRating.id},
          data: {stars: createRating.stars},
          include: {user: true},
        });

        pusherEvents();

        return BasicRatingSchema.parse(editedRating);
      } else {
        const newRating = await prisma.rating.create({
          data: {
            ...createRating,
            event: {connect: {id: eventId}},
            user: {connect: {id: callerId}},
          },
          include: {user: true},
        });

        pusherEvents();

        return BasicRatingSchema.parse(newRating);
      }
    }),
});
