import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// Load Vercel-pulled env file first (preferred), then any local .env.
config({ path: ".env.development.local" });
config({ path: ".env.local" });
config();

const url =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL;

if (!url) {
  throw new Error(
    "No Postgres connection string found. Set DATABASE_URL_UNPOOLED, DATABASE_URL, or POSTGRES_URL.",
  );
}

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
} satisfies Config;
