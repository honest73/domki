import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

const COOKIE = "bryziowka_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dni

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("Brak SESSION_SECRET w konfiguracji (.env)");
  return s;
}

// Podpisany token sesji: "<payload>.<hmac>" zakodowane base64url.
function sign(payload: string): string {
  const hmac = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${hmac}`;
}

function verify(token: string | undefined): boolean {
  if (!token) return false;
  const [body, hmac] = token.split(".");
  if (!body || !hmac) return false;
  const payload = Buffer.from(body, "base64url").toString();
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  // porównanie odporne na atak czasowy
  if (hmac.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected))) return false;
  const exp = Number(payload.split("|")[1]);
  return Number.isFinite(exp) && exp > Date.now();
}

/** Sprawdza hasło właściciela. Obsługuje hasło jawne lub hash bcrypt w OWNER_PASSWORD. */
export async function checkPassword(input: string): Promise<boolean> {
  const stored = process.env.OWNER_PASSWORD;
  if (!stored) throw new Error("Brak OWNER_PASSWORD w konfiguracji (.env)");
  if (stored.startsWith("$2")) return bcrypt.compare(input, stored);
  // proste, stałoczasowe porównanie dla hasła jawnego
  const a = Buffer.from(input);
  const b = Buffer.from(stored);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function createSession(): Promise<void> {
  const exp = Date.now() + MAX_AGE * 1000;
  const token = sign(`owner|${exp}`);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function isLoggedIn(): Promise<boolean> {
  return verify((await cookies()).get(COOKIE)?.value);
}

/** Token w linku grafiku sprzątania (bez logowania). */
export function checkCleaningToken(token: string): boolean {
  const expected = process.env.CLEANING_TOKEN;
  if (!expected || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
