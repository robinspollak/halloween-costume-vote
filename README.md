# Costume Contest

Mobile voting page for a Halloween costume contest. Guests pick their own name and a winner for best overall, scariest and funniest from the guest list (or type in Other). One ballot per name. Hosts see tallies at `/results`.

Astro on Vercel, Neon Postgres via Drizzle. Migrations run on deploy.

## Setup

- `ADMIN_PASSWORD`: unlocks `/results`. Results stay locked until it's set.
- Load the guest list (names live only in the database, never in this repo):
  `DATABASE_URL=... npx tsx scripts/import-guests.mts guests.csv`
