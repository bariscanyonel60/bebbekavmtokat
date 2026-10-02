import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { decryptSession, encryptSession, SESSION_COOKIE, SESSION_TTL_SECONDS, type SessionPayload } from "@/lib/auth/token";
import { db } from "@/lib/db";

export async function createSession(payload: Omit<SessionPayload, "expiresAt">): Promise<void> {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const token = await encryptSession({ ...payload, expiresAt });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function deleteSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export const getAdminUser = cache(async () => {
  const store = await cookies();
  const session = await decryptSession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });
  return user && user.isActive ? user : null;
});

/** Her admin sayfası ve server action'da çağrılır; proxy tek başına yetkilendirme sınırı değildir. */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/giris");
  return user;
}
