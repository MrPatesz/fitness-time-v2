import {z} from "zod";
import {IdSchema} from "../../../models/Id";
import {createTRPCRouter, protectedProcedure} from "../trpc";
import {AverageRatingSchema, BasicRatingSchema, CreateRatingSchema} from "../../../models/Rating";

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
      createRating: CreateRatingSchema,
      eventId: IdSchema,
    }))
    .output(BasicRatingSchema)
    .mutation(async ({input: {createRating, eventId}, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const findRating = await prisma.rating.findFirst({
        where: {userId: callerId, eventId},
      });

      if (!!findRating) {
        const editedRating = await prisma.rating.update({
          where: {id: findRating.id},
          data: {stars: createRating.stars},
          include: {user: true},
        });

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

        return BasicRatingSchema.parse(newRating);
      }
    }),
});
