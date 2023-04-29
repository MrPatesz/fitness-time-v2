import {Pool} from 'pg'
import {Kysely, PostgresDialect,} from 'kysely'
import {env} from "../../env.js";
import {DB} from "./generatedTypes";

const globalForKysely = globalThis as unknown as { kysely: Kysely<DB> };

export const kysely =
  globalForKysely.kysely ||
  new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        user: "postgres",
        password: "root",
        host: 'localhost',
        port: 5432,
        database: 'fitness-time-db',
      })
    })
  })

if (env.NODE_ENV !== "production") globalForKysely.kysely = kysely;
