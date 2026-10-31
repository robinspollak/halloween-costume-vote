import { createHash } from "node:crypto";

export const ADMIN_COOKIE = "boo";

// No default: the repo is public, so results stay locked until ADMIN_PASSWORD is set.
function adminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD ?? import.meta.env.ADMIN_PASSWORD;
}

export function adminConfigured(): boolean {
  return Boolean(adminPassword());
}

export function adminToken(): string {
  return createHash("sha256").update(`boo:${adminPassword()}`).digest("hex");
}

export function passwordMatches(input: string): boolean {
  const pw = adminPassword();
  return Boolean(pw) && input.trim().toLowerCase() === pw!.toLowerCase();
}

export function isAdmin(cookieValue: string | undefined): boolean {
  return adminConfigured() && cookieValue === adminToken();
}
