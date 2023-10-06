import {PrismaClient} from '@prisma/client';
import {Session} from 'next-auth';
import {appRouter} from '../../../../../src/server/api/root';
import {env} from '../../../../../src/env.mjs';
import {DB} from '../../../../../src/server/kysely/generatedTypes';
import {Kysely} from 'kysely';
import PusherServer from 'pusher';

// TODO mock this correctly once it is used
const testKyselyClient = undefined as unknown as Kysely<DB>;

const testPusherClient = {
  trigger: (_channel: unknown, _event: unknown, _data: unknown) => Promise.resolve(),
} as unknown as PusherServer;

export const testPrismaClient = new PrismaClient({
  datasources: {db: {url: `${env.POSTGRES_PRISMA_URL}-test`}}, // TODO env.TEST_DB_URL
});

export const getTestCaller = (user: Session['user'] | null) => {
  const session = user ? ({expires: new Date().toISOString(), user: user} satisfies Session) : null;

  return appRouter.createCaller({
    prisma: testPrismaClient,
    session,
    kysely: testKyselyClient,
    pusher: testPusherClient,
  });
};
