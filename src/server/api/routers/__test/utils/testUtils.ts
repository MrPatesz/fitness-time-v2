import {appRouter} from "../../../root";
import {Session} from "next-auth";
import {PrismaClient} from "@prisma/client";
import {EventEmitter} from "events";
import {kysely} from "../../../../kysely/kysely";
import {DefaultMantineColor} from "@mantine/core";

interface User {
  id: string;
  name: string | null | undefined;
  image?: string | null | undefined;
  email?: string | null | undefined;
  themeColor: DefaultMantineColor | null;
}

const sessionMock: Session = {
  expires: new Date().toISOString(),
  user: {id: "", name: undefined, themeColor: null},
};

export const testPrismaClient = new PrismaClient({datasources: {db: {url: `${process.env.DATABASE_URL}-test`}}});

const caller = appRouter.createCaller({
  prisma: testPrismaClient,
  session: null,
  kysely,
  emitter: new EventEmitter(),
});

export type TestCaller = typeof caller;

export const getTestCaller = (overrideUser?: User | null): TestCaller => {
  const session = overrideUser ? {...sessionMock, user: overrideUser} : (overrideUser === null ? null : sessionMock);

  return appRouter.createCaller({
    prisma: testPrismaClient,
    session,
    kysely,
    emitter: new EventEmitter(),
  });
};
