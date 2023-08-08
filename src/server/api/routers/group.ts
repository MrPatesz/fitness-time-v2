import {z} from 'zod';
import {BasicGroupSchema, DetailedGroupSchema, MutateGroupSchema} from '../../../models/Group';
import {PaginateGroupsSchema} from '../../../models/pagination/PaginateGroups';
import {createTRPCRouter, protectedProcedure} from '../trpc';
import {Prisma} from '.prisma/client';
import {IdSchema} from '../../../models/Utils';
import {InvalidateEvent, PusherChannel} from '../../../utils/enums';

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
          mode: 'insensitive',
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
    .mutation(async ({input: createGroup, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      await prisma.group.create({
        data: {
          ...createGroup,
          creator: {connect: {id: callerId}},
          members: {connect: {id: callerId}},
        },
      });
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.GroupGetPaginatedGroups, null);
      // TODO await pusher.trigger(PusherChannel.INVALIDATE, PusherEvent.UserGetById, callerId);
    }),
  update: protectedProcedure
    .input(z.object({group: MutateGroupSchema, id: IdSchema}))
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      await prisma.group.update({
        where: {id: input.id, creatorId: callerId},
        data: {
          ...input.group,
          creator: {connect: {id: callerId}},
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.GroupGetById, input.id);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.GroupGetPaginatedGroups, null);
      // TODO await pusher.trigger(PusherChannel.INVALIDATE, PusherEvent.UserGetById, null);
    }),
  delete: protectedProcedure
    .input(IdSchema)
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      await prisma.group.delete({
        where: {
          id: input,
          creatorId: callerId,
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.GroupGetById, input);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.GroupGetPaginatedGroups, null);
      // TODO await pusher.trigger(PusherChannel.INVALIDATE, PusherEvent.UserGetById, null);
    }),
  join: protectedProcedure
    .input(z.object({id: IdSchema, join: z.boolean()}))
    .mutation(async ({input: {id: groupId, join}, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      await prisma.group.update({
        where: {id: groupId},
        data: {
          members: join ? {
            connect: {id: callerId},
          } : {
            disconnect: {id: callerId},
          },
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.GroupGetById, groupId);
      // TODO await pusher.trigger(PusherChannel.INVALIDATE, PusherEvent.UserGetById, callerId);
    }),
  // TODO give ownership
});
