import {z} from "zod";
import {BasicCommentSchema, CreateCommentSchema, DetailedCommentSchema} from "../../../models/Comment";
import {IdSchema} from "../../../models/Id";
import {createTRPCRouter, protectedProcedure} from "../trpc";
import {Prisma} from ".prisma/client";
import {SortDirection} from "../../../models/event/PaginateEvents";

export enum SortCommentByProperty {
  MESSAGE = "message",
  POSTED_AT = "postedAt",
  EVENT = "event",
}

export const commentRouter = createTRPCRouter({
  getAllByEventId: protectedProcedure
    .input(IdSchema)
    .output(BasicCommentSchema.array())
    .query(async ({input: eventId, ctx}) => {
      const comments = await ctx.prisma.comment.findMany({
        where: {eventId},
        include: {user: true},
        orderBy: {postedAt: Prisma.SortOrder.desc},
      });

      return BasicCommentSchema.array().parse(comments);
    }),
  getAllCreated: protectedProcedure
    .input(z.object({
      page: z.number().min(1),
      pageSize: z.number().min(5).max(50),
      searchQuery: z.string(),
      sortBy: z.object({
        property: z.nativeEnum(SortCommentByProperty),
        direction: z.nativeEnum(SortDirection),
      }),
    }))
    .output(z.object({comments: DetailedCommentSchema.array(), size: z.number()}))
    .query(async ({input: {page, pageSize, sortBy, searchQuery}, ctx: {prisma, session: {user: {id: callerId}}}}) => {
      const orderBy: {
        message?: Prisma.SortOrder;
        postedAt?: Prisma.SortOrder;
        event?: { name: Prisma.SortOrder };
      } = {};
      if (sortBy.property === SortCommentByProperty.EVENT) {
        orderBy[sortBy.property] = {name: sortBy.direction};
      } else {
        orderBy[sortBy.property] = sortBy.direction;
      }

      const where = {
        userId: callerId,
        message: {
          mode: "insensitive",
          contains: searchQuery,
        } as Prisma.StringFilter,
      };

      const [comments, numberOfComments] = await prisma.$transaction([
        prisma.comment.findMany({
          where,
          include: {user: true, event: {include: {location: true, creator: true, group: {include: {creator: true}}}}},
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy,
        }),
        prisma.comment.count({
          where,
        }),
      ]);

      return {
        comments: DetailedCommentSchema.array().parse(comments),
        size: numberOfComments,
      };
    }),
  create: protectedProcedure
    .input(z.object({createComment: CreateCommentSchema, eventId: IdSchema}))
    .output(BasicCommentSchema)
    .mutation(async ({input: {createComment, eventId}, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const comment = await prisma.comment.create({
        data: {
          ...createComment,
          event: {connect: {id: eventId}},
          user: {connect: {id: callerId}},
        },
        include: {user: true},
      });

      return BasicCommentSchema.parse(comment);
    }),
  update: protectedProcedure
    .input(z.object({comment: CreateCommentSchema, commentId: IdSchema, eventId: IdSchema}))
    .output(BasicCommentSchema)
    .mutation(async ({input: {commentId, comment, eventId}, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const updatedComment = await prisma.comment.update({
        where: {id: commentId},
        data: {
          ...comment,
          event: {connect: {id: eventId}},
          user: {connect: {id: callerId}},
        },
        include: {user: true},
      });

      return BasicCommentSchema.parse(updatedComment);
    }),
  delete: protectedProcedure
    .input(IdSchema)
    .output(z.boolean())
    .mutation(async ({input, ctx: {session: {user: {id: callerId}}, prisma}}) => {
      const {count} = await prisma.comment.deleteMany({
        where: {
          id: input,
          userId: callerId,
        },
      });

      return Boolean(count);
    }),
});
