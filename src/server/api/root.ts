import {eventRouter} from "./routers/event";
import {exampleRouter} from "./routers/example";
import {groupRouter} from "./routers/group";
import {userRouter} from "./routers/user";
import {createTRPCRouter} from "./trpc";
import {commentRouter} from "./routers/comment";
import {groupChatRouter} from "./routers/groupChat";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  comment: commentRouter,
  event: eventRouter,
  example: exampleRouter,
  group: groupRouter,
  user: userRouter,
  groupChat: groupChatRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
