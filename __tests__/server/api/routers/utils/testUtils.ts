import {PrismaClient} from '@prisma/client';
import {Session} from 'next-auth';
import PusherServer from 'pusher';
import {env} from '../../../../../src/env.mjs';
import {appRouter} from '../../../../../src/server/api/root';

const testPusherClient = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    pusher: testPusherClient,
  });
};
