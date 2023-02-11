import {createNextApiHandler} from "@trpc/server/adapters/next";

import {env} from "../../../env.mjs";
import {createTRPCContext} from "../../../server/api/trpc";
import {appRouter} from "../../../server/api/root";
import {signOut} from "next-auth/react";
import {TRPC_ERROR_CODE_KEY} from "@trpc/server/src/rpc/codes";

const signOutOnUnauthorized = (statusCode: TRPC_ERROR_CODE_KEY) => {
  if (statusCode === "UNAUTHORIZED") {
    signOut({callbackUrl: "/welcome"});
  }
};

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({path, error}) => {
        console.error(
          `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
        );
        signOutOnUnauthorized(error.code);
      }
      : ({error}) => signOutOnUnauthorized(error.code),
});
