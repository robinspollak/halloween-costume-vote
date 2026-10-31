CREATE TABLE "guests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "guests_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"voter" text NOT NULL,
	"voter_key" text NOT NULL,
	"best" text NOT NULL,
	"scariest" text NOT NULL,
	"funniest" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "votes_voter_key_unique" UNIQUE("voter_key")
);
