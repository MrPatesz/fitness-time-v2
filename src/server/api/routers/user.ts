import {createTRPCRouter, protectedProcedure} from "../trpc";
import {z} from "zod";
import {BasicUserSchema, DetailedUserSchema} from "../../../models/User";

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure
    .output(BasicUserSchema.array())
    .query(async ({ctx}) => {
      const events = await ctx.prisma.user.findMany();
      return BasicUserSchema.array().parse(events);
    }),
  profile: protectedProcedure
    .output(DetailedUserSchema)
    .query(async ({ctx: {prisma, session: {user: {id: userId}}}}) => {
      const user = await prisma.user.findUnique({
        where: {id: userId},
        include: {createdEvents: true, participatedEvents: true}
      });

      return DetailedUserSchema.parse(user);
    }),
  getById: protectedProcedure
    .input(z.string())
    .output(BasicUserSchema)
    .query(async ({input: id, ctx}) => {
      const user = await ctx.prisma.user.findFirst({
        where: {id},
      });

      return BasicUserSchema.parse(user)
    }),
  update: protectedProcedure
    .input(BasicUserSchema)
    .output(BasicUserSchema)
    .mutation(async ({input, ctx}) => {
      const updatedEvent = await ctx.prisma.user.update({
        where: {id: input.id},
        data: input,
      });
      return BasicUserSchema.parse(updatedEvent);
    }),
});
