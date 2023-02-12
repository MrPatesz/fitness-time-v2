import {createTRPCRouter, protectedProcedure} from "../trpc";
import {z} from "zod";

export const userRouter = createTRPCRouter({
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
    // .output(UserSchema)
    .query(({input, ctx}) => {
      return ctx.prisma.user.findFirst({
        where: {
          id: input
        }
      })
    }),
});
