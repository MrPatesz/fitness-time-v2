import {createTRPCRouter, protectedProcedure} from "../trpc";
import {z} from "zod";
import {BasicUserSchema} from "../../../models/User";

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure
    .output(BasicUserSchema.array())
    .query(async ({ctx}) => {
      const events = await ctx.prisma.user.findMany({
        include: {createdEvents: true, participatedEvents: true}
      });

      return BasicUserSchema.array().parse(events);
    }),
  profile: protectedProcedure
    .output(BasicUserSchema)
    .query(async ({ctx}) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });

      return BasicUserSchema.parse(user);
    }),
  getById: protectedProcedure
    .input(z.string())
    .output(BasicUserSchema)
    .query(async ({input, ctx}) => {
      const user = await ctx.prisma.user.findFirst({
        where: {id: input},
        include: {createdEvents: true, participatedEvents: true}
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
