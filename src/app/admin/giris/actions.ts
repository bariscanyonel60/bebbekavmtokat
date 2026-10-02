"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fail, str, type ActionState } from "@/lib/admin/form";
import { createSession, deleteSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

const loginSchema = z.object({
  email: z.email("Geçerli bir e-posta girin.").max(190),
  password: z.string().min(1, "Şifre gerekli.").max(200),
});

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

/** Tek sunucu örneği için basit kaba kuvvet freni; çok örnekli ortamda WAF/edge limiti ile desteklenmelidir. */
function isThrottled(email: string): boolean {
  const now = Date.now();
  const entry = attempts.get(email);
  if (!entry || entry.resetAt < now) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(email: string) {
  const now = Date.now();
  const entry = attempts.get(email);
  if (!entry || entry.resetAt < now) attempts.set(email, { count: 1, resetAt: now + WINDOW_MS });
  else entry.count += 1;
}

function safeNext(value: string): string {
  return /^\/admin(\/[\w\-/]*)?(\?[\w\-=&%]*)?$/.test(value) && !value.startsWith("/admin/giris") ? value : "/admin";
}

export async function login(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ email: str(form, "email").toLowerCase(), password: form.get("password") });
  if (!parsed.success) return fail("E-posta veya şifre hatalı.");
  const { email, password } = parsed.data;

  if (isThrottled(email)) return fail("Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.");

  const user = await db.user.findUnique({ where: { email } });
  const valid = user?.isActive ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !valid) {
    recordFailure(email);
    return fail("E-posta veya şifre hatalı.");
  }

  attempts.delete(email);
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession({ userId: user.id, role: user.role });
  redirect(safeNext(str(form, "next")));
}

export async function logout() {
  await deleteSession();
  redirect("/admin/giris");
}
