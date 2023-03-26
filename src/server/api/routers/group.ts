import {z} from "zod";
import {BasicGroupSchema, CreateGroupSchema, DetailedGroupSchema} from "../../../models/Group";
import {IdSchema} from "../../../models/Id";
import {createTRPCRouter, protectedProcedure} from "../trpc";
import {Prisma} from ".prisma/client";

export const groupRouter = createTRPCRouter({
  getAll: protectedProcedure
    .output(BasicGroupSchema.array())
    .query(async ({ctx}) => {
      const groups = await ctx.prisma.group.findMany({
        orderBy: {name: Prisma.SortOrder.asc},
        include: {creator: true},
      });

      return BasicGroupSchema.array().parse(groups);
    }),
  getById: protectedProcedure
    .input(IdSchema)
    .output(DetailedGroupSchema)
    .query(async ({input: id, ctx}) => {
      const group = await ctx.prisma.group.findUnique({
        where: {id},
        include: {creator: true, members: true},
      });

      return DetailedGroupSchema.parse(group);
    }),
  create: protectedProcedure
    .input(CreateGroupSchema)
    .output(BasicGroupSchema)
    .mutation(async ({input: createGroup, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const group = await prisma.group.create({
        data: {
          ...createGroup,
          creator: {connect: {id: callerId}},
          members: {connect: {id: callerId}},
        },
        include: {creator: true},
      });

      return BasicGroupSchema.parse(group);
    }),
  update: protectedProcedure
    .input(z.object({group: CreateGroupSchema, id: IdSchema}))
    .output(BasicGroupSchema)
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const updatedGroup = await prisma.group.update({
        where: {id: input.id},
        data: {
          ...input.group,
          creator: {connect: {id: callerId}},
        },
        include: {creator: true},
      });

      return BasicGroupSchema.parse(updatedGroup);
    }),
  delete: protectedProcedure
    .input(IdSchema)
    .output(z.boolean())
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const {count} = await prisma.group.deleteMany({
        where: {
          id: input,
          creatorId: callerId,
        },
      });

      return !!count;
    }),
  join: protectedProcedure
    .input(z.object({id: IdSchema, join: z.boolean()}))
    .output(z.boolean())
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const result = await prisma.group.update({
        where: {id: input.id},
        data: {
          members: input.join ? {
            connect: {id: callerId},
          } : {
            disconnect: {id: callerId},
          },
        },
      });

      return Boolean(result);
    }),
  // TODO give ownership
});
