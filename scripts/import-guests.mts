// Loads the guest list into the database:
//   DATABASE_URL=... npx tsx scripts/import-guests.mts path/to/guests.csv
// Skips "Can't Go" guests and placeholder rows like "X's +1" / "friend of X"
// (those people can use Other). Safe to re-run; existing names are kept.
import { readFileSync } from "node:fs";
import postgres from "postgres";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const path = process.argv[2];
const url = process.env.DATABASE_URL;
if (!path || !url) {
  console.error("usage: DATABASE_URL=... npx tsx scripts/import-guests.mts guests.csv");
  process.exit(1);
}

const [header, ...rows] = parseCsv(readFileSync(path, "utf8"));
const nameCol = header.indexOf("Name");
const statusCol = header.indexOf("Status");

const seen = new Map<string, string>();
for (const r of rows) {
  const name = (r[nameCol] ?? "").trim().replace(/\s+/g, " ");
  const status = (r[statusCol] ?? "").replace(/\s/g, " ").toLowerCase();
  if (!name || status.startsWith("can't")) continue;
  if (/\+1|^friend of /i.test(name)) continue;
  if (!seen.has(name.toLowerCase())) seen.set(name.toLowerCase(), name);
}

const sql = postgres(url, { prepare: false, max: 1 });
const names = [...seen.values()];
await sql`insert into guests ${sql(names.map((name) => ({ name })))} on conflict (name) do nothing`;
const [{ count }] = await sql`select count(*)::int as count from guests`;
console.log(`Imported ${names.length} names; ${count} guests in the database.`);
await sql.end();
