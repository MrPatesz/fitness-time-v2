import {createTRPCRouter, protectedProcedure} from "../trpc";
import {z} from "zod";
import {UserSchema} from "../../../models/User";

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure
    .output(UserSchema.array())
    .query(async ({ctx}) => {
      const events = await ctx.prisma.user.findMany({
        include: {createdEvents: true, participatedEvents: true}
      });

      return UserSchema.array().parse(events);
    }),
  profile: protectedProcedure
    // .output(UserSchema)
    .query(({ctx}) => {
      return ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });
    }),
  getById: protectedProcedure
    .input(z.string())
    .output(UserSchema)
    .query(async ({input, ctx}) => {
      const user = await ctx.prisma.user.findFirst({
        where: {id: input},
        include: {createdEvents: true, participatedEvents: true}
      });

      return UserSchema.parse(user)
    }),
});
