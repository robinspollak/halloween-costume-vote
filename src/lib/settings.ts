import { eq } from "drizzle-orm";
import { db, settings } from "../db";

export async function votingOpen(): Promise<boolean> {
  const [row] = await db.select({ votingOpen: settings.votingOpen }).from(settings).where(eq(settings.id, 1));
  return row?.votingOpen ?? true;
}

export async function setVotingOpen(open: boolean): Promise<void> {
  await db
    .insert(settings)
    .values({ id: 1, votingOpen: open })
    .onConflictDoUpdate({ target: settings.id, set: { votingOpen: open } });
}
