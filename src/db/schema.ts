import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Loaded from the party's guest-list CSV by scripts/import-guests.mts, so
// real names never land in this (public) repo.
export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// One row per voter. voterKey is the lowercased name and enforces one vote each.
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  voter: text("voter").notNull(),
  voterKey: text("voter_key").notNull().unique(),
  best: text("best").notNull(),
  scariest: text("scariest").notNull(),
  funniest: text("funniest").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Single row (id 1) of contest-wide switches.
export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  votingOpen: boolean("voting_open").notNull().default(true),
});

export type Vote = typeof votes.$inferSelect;
