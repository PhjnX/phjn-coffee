import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Admin sign-in with a single shared password from ADMIN_PASSWORD (.env.local). After signing in
 * the browser gets a signed, http-only cookie; every admin page and action checks it.
 * With no password set, local development falls back to "phjn-admin" and the login page says so.
 */

const COOKIE = "phjn_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // a week

export const DEV_PASSWORD = "phjn-admin";

export function adminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? null : DEV_PASSWORD);
}

function sign(value: string): string {
  const secret = process.env.ADMIN_SECRET || `phjn:${adminPassword() ?? ""}`;
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function same(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function signIn(password: string): Promise<boolean> {
  const expected = adminPassword();
  if (!expected || !same(password, expected)) return false;
  const expires = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [expires, sig] = raw.split(".");
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  return same(sig, sign(expires));
}

/** Use at the top of every admin page and server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
