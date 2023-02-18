import {z} from "zod";
import {LocationSchema} from "../../../models/Location";
import {BasicUserSchema, DetailedUserSchema, ProfileSchema} from "../../../models/User";
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
    .output(ProfileSchema)
    .query(async ({ctx: {prisma, session: {user: {id: userId}}}}) => {
      const user = await prisma.user.findUnique({
        where: {id: userId},
        include: {
          createdEvents: {include: {location: true}},
          participatedEvents: {include: {location: true}},
          location: true
        }
      });

      return ProfileSchema.parse(user);
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
    .input(BasicUserSchema.extend({
      location: LocationSchema.nullable(),
    }))
    .output(BasicUserSchema.extend({
      location: LocationSchema.nullable(),
    }))
    .mutation(async ({input, ctx}) => {
      // TODO update location
      const updatedEvent = await ctx.prisma.user.update({
        where: {id: input.id},
        data: {
          ...input,
          location: input.location ? {
            connectOrCreate: {
              where: {
                address: input.location.address
              },
              create: input.location
            }
          } : {disconnect: true}
        },
      });
      return ProfileSchema.parse(updatedEvent);
    }),
});
