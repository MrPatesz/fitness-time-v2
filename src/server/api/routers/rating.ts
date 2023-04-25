import {z} from "zod";
import {IdSchema} from "../../../models/Id";
import {createTRPCRouter, protectedProcedure} from "../trpc";
import {BasicRatingSchema, CreateRatingSchema, StarsSchema} from "../../../models/Rating";

export const ratingRouter = createTRPCRouter({
  // TODO getAverageRatingForGroup
  getAverageRatingForEvent: protectedProcedure
    .input(IdSchema)
    .output(z.object({
      count: z.number(),
      averageStars: StarsSchema.nullable(),
    }))
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
    .output(z.object({
      count: z.number(),
      averageStars: StarsSchema.nullable(),
    }))
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
