import {z} from 'zod';
import {PaginateUsersSchema} from '../../../models/pagination/PaginateUsers';
import {BasicUserSchema, DetailedUserSchema, ProfileSchema, UpdateProfileSchema} from '../../../models/User';
import {createTRPCRouter, protectedProcedure} from '../trpc';
import {Prisma} from '.prisma/client';
import {InvalidateEvent, PusherChannel} from '../../../utils/enums';

export const userRouter = createTRPCRouter({
  getPaginatedUsers: protectedProcedure
    .input(PaginateUsersSchema)
    .output(z.object({users: BasicUserSchema.array(), size: z.number()}))
    .query(async ({
                    input: {page, pageSize, sortBy, searchQuery},
                    ctx: {prisma},
                  }) => {
      const where = searchQuery ? {
        name: {
          mode: 'insensitive',
          contains: searchQuery,
        } as Prisma.StringFilter,
      } : undefined;

      const [users, numberOfUsers] = await prisma.$transaction([
        prisma.user.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: {name: sortBy.direction},
        }),
        prisma.user.count({
          where,
        }),
      ]);

      return {
        users: BasicUserSchema.array().parse(users),
        size: numberOfUsers,
      };
    }),
  profile: protectedProcedure
    .output(ProfileSchema)
    .query(async ({ctx: {prisma, session: {user: {id: userId}}}}) => {
      const user = await prisma.user.findUnique({
        where: {id: userId},
        include: {location: true},
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
          createdEvents: {
            include: {location: true, creator: true, group: {include: {creator: true}}},
            orderBy: {start: Prisma.SortOrder.desc},
          },
          participatedEvents: {
            where: {creatorId: {not: id}},
            include: {location: true, creator: true, group: {include: {creator: true}}},
            orderBy: {start: Prisma.SortOrder.desc},
          },
        },
      });

      return DetailedUserSchema.parse(user);
    }),
  update: protectedProcedure
    .input(UpdateProfileSchema)
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma, pusher}}) => {
      await prisma.user.update({
        where: {id: callerId},
        data: {
          ...input,
          location: input.location ? {
            connectOrCreate: {
              where: {
                address: input.location.address,
              },
              create: input.location,
            }
          } : {disconnect: true},
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.UserGetById, callerId);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.UserGetPaginatedUsers, null);
    }),
});
