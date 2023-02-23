import {createTRPCRouter, publicProcedure} from "../trpc";

export const exampleRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ctx}) => {
    return ctx.prisma.example.findMany();
  }),
});
