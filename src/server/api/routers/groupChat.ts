import {z} from 'zod';
import {BasicMessageSchema, CreateMessageSchema} from '../../../models/Message';
import {createTRPCRouter, protectedProcedure} from '../trpc';
import {Prisma} from '.prisma/client';
import {IdSchema} from '../../../models/Utils';
import {InvalidateEvent, PusherChannel} from '../../../utils/enums';

export const groupChatRouter = createTRPCRouter({
  getMessages: protectedProcedure
    .input(z.object({
      groupId: IdSchema,
      cursor: z.date().nullish(),
    }))
    .output(z.object({
      messages: BasicMessageSchema.array(),
      nextCursor: z.date().nullish(),
    }))
    .query(async ({input: {cursor, groupId}, ctx}) => {
      const limit = 10;

      // TODO get these in reverse, so FE doesn't have to reverse them
      // TODO only group members should be able to get this data
      const messages = await ctx.prisma.message.findMany({
        where: {groupId},
        take: -(limit + 1),
        cursor: cursor ? {postedAt: cursor} : undefined,
        orderBy: {postedAt: Prisma.SortOrder.asc},
        include: {user: true},
      });

      let nextCursor: Date | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.shift();
        nextCursor = nextItem?.postedAt;
      }

      return {
        messages: BasicMessageSchema.array().parse(messages),
        nextCursor,
      };
    }),
  create: protectedProcedure
    .input(z.object({createMessage: CreateMessageSchema, groupId: IdSchema}))
    .output(z.void())
    .mutation(async (
      {
        input: {createMessage, groupId},
        ctx: {session: {user: {id: callerId}}, prisma, pusher}
      }
    ) => {
      await prisma.message.create({
        data: {
          ...createMessage,
          group: {connect: {id: groupId}},
          user: {connect: {id: callerId}},
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.GroupChatGetMessages, groupId);
    }),
});
