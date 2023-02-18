import {z} from "zod";
import {BasicUserSchema, DetailedUserSchema, ProfileUserSchema} from "../../../models/User";
import {createTRPCRouter, protectedProcedure} from "../trpc";
import {Prisma} from ".prisma/client";

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure
    .output(BasicUserSchema.array())
    .query(async ({ctx}) => {
      const events = await ctx.prisma.user.findMany({
        orderBy: {name: Prisma.SortOrder.asc}
      });
      return BasicUserSchema.array().parse(events);
    }),
  profile: protectedProcedure
    .output(ProfileUserSchema)
    .query(async ({ctx: {prisma, session: {user: {id: userId}}}}) => {
      const user = await prisma.user.findUnique({
        where: {id: userId},
        include: {
          createdEvents: {include: {location: true}},
          participatedEvents: {include: {location: true}},
          location: true
        }
      });

      return ProfileUserSchema.parse(user);
    }),
  getById: protectedProcedure
    .input(z.string())
    .output(DetailedUserSchema)
    .query(async ({input: id, ctx}) => {
      const user = await ctx.prisma.user.findFirst({
        where: {id},
        include: {
          createdEvents: {include: {location: true}},
          participatedEvents: {include: {location: true}}
        }
      });

      return DetailedUserSchema.parse(user);
    }),
  update: protectedProcedure
    .input(BasicUserSchema)
    .output(BasicUserSchema)
    .mutation(async ({input, ctx}) => {
      // TODO update location
      const updatedEvent = await ctx.prisma.user.update({
        where: {id: input.id},
        data: input,
      });
      return BasicUserSchema.parse(updatedEvent);
    }),
});
