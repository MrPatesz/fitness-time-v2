import {z} from "zod";
import {BasicGroupSchema, DetailedGroupSchema, MutateGroupSchema} from "../../../models/Group";
import {PaginateGroupsSchema} from "../../../models/pagination/PaginateGroups";
import {createTRPCRouter, protectedProcedure} from "../trpc";
import {Prisma} from ".prisma/client";
import {IdSchema} from "../../../models/Utils";

export const groupRouter = createTRPCRouter({
  getPaginatedGroups: protectedProcedure
    .input(PaginateGroupsSchema)
    .output(z.object({groups: BasicGroupSchema.array(), size: z.number()}))
    .query(async ({
                    input: {page, pageSize, sortBy, createdOnly, searchQuery},
                    ctx: {session: {user: {id: callerId}}, prisma}
                  }) => {
      const orderBy: {
        name?: Prisma.SortOrder;
        createdAt?: Prisma.SortOrder;
        // memberCount?: Prisma.SortOrder;
      } = {};
      orderBy[sortBy.property] = Prisma.SortOrder[sortBy.direction];

      const where = {
        creatorId: createdOnly ? callerId : undefined,
        name: searchQuery ? ({
          mode: "insensitive",
          contains: searchQuery,
        } as Prisma.StringFilter) : undefined,
      };

      const [groups, numberOfGroups] = await prisma.$transaction([
        prisma.group.findMany({
          where,
          include: {creator: true},
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy,
        }),
        prisma.group.count({
          where,
        }),
      ]);

      return {
        groups: BasicGroupSchema.array().parse(groups),
        size: numberOfGroups,
      };
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
    .input(MutateGroupSchema)
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
    .input(z.object({group: MutateGroupSchema, id: IdSchema}))
    .output(BasicGroupSchema)
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const updatedGroup = await prisma.group.update({
        where: {id: input.id, creatorId: callerId},
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

      return Boolean(count);
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
