import {z} from "zod";
import {BasicCommentSchema, CreateCommentSchema} from "../../../models/Comment";
import {IdSchema} from "../../../models/Id";
import {createTRPCRouter, protectedProcedure} from "../trpc";

export const commentRouter = createTRPCRouter({
  getAllByEventId: protectedProcedure
    .input(IdSchema)
    .output(BasicCommentSchema.array())
    .query(async ({input: eventId, ctx}) => {
      const comments = await ctx.prisma.comment.findMany({
        where: {eventId},
        include: {user: true},
      });

      return BasicCommentSchema.array().parse(comments);
    }),
  getAllByUserId: protectedProcedure
    .input(z.string())
    .output(BasicCommentSchema.array())
    .query(async ({input: userId, ctx}) => {
      const comments = await ctx.prisma.comment.findMany({
        where: {userId},
        include: {user: true},
      });

      return BasicCommentSchema.array().parse(comments);
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

      return !!count;
    }),
});
