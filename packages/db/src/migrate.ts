import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

config({
  path: new URL("../../../apps/runtime/.env.local", import.meta.url),
  quiet: true,
});
config({ path: new URL("../../../apps/runtime/.env", import.meta.url), quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to run Cradle database migrations.");

const pool = new Pool({ connectionString: databaseUrl });
try {
  await migrate(drizzle(pool), {
    migrationsFolder: fileURLToPath(new URL("../drizzle", import.meta.url)),
  });
} finally {
  await pool.end();
}
