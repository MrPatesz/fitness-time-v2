import {z} from 'zod';
import {createTRPCRouter, protectedProcedure, publicProcedure} from '../trpc';

export const exampleRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ctx}) => {
    return ctx.prisma.example.findMany();
  }),

  hello: publicProcedure
    .input(z.object({text: z.string()}))
    .query(({input: {text}}) => {
      return {
        greeting: `Hello ${text}`,
      };
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return 'you can now see this secret message!';
  })
});
