import {PrismaClient} from "@prisma/client";
import {Session} from "next-auth";
import {ThemeColor} from "../../../../../utils/enums";
import {kysely} from "../../../../kysely/kysely";
import {pusher} from "../../../../pusher";
import {appRouter} from "../../../root";

const sessionMock: Session = {
  expires: new Date().toISOString(),
  user: {id: "", name: undefined, themeColor: ThemeColor.VIOLET, hasLocation: false},
};

export const testPrismaClient = new PrismaClient({datasources: {db: {url: `${process.env.DATABASE_URL}-test`}}});

const caller = appRouter.createCaller({
  prisma: testPrismaClient,
  session: null,
  kysely,
  pusher,
});

export type TestCaller = typeof caller;

export const getTestCaller = (overrideUser?: Session["user"] | null): TestCaller => {
  const session = overrideUser ? {...sessionMock, user: overrideUser} : (overrideUser === null ? null : sessionMock);

  return appRouter.createCaller({
    prisma: testPrismaClient,
    session,
    kysely,
    pusher,
  });
};
