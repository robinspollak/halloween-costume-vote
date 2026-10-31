import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  import.meta.env.DATABASE_URL ??
  import.meta.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Run `vercel env pull .env.development.local` locally.",
  );
}

// prepare: false keeps us compatible with Neon's pooled (pgbouncer) endpoint.
const client = postgres(connectionString, { prepare: false, max: 5 });

export const db = drizzle(client, { schema });

export * from "./schema";
