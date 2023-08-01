import {Kysely, PostgresDialect,} from 'kysely';
import {Pool} from 'pg';
import {env} from '../../env.mjs';
import {DB} from './generatedTypes';

const globalForKysely = globalThis as unknown as { kysely: Kysely<DB> };

export const kysely =
  globalForKysely.kysely ||
  new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        user: env.POSTGRES_USER,
        password: env.POSTGRES_PASSWORD,
        host: env.POSTGRES_HOST,
        port: env.POSTGRES_PORT,
        database: env.POSTGRES_DATABASE,
      })
    })
  });

if (env.NODE_ENV !== 'production') globalForKysely.kysely = kysely;
