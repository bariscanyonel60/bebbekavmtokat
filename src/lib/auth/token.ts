import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "bebbek_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

export type SessionPayload = { userId: string; role: "ADMIN" | "EDITOR"; expiresAt: number };

function getKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET en az 32 karakter olmalıdır.");
  }
  return new TextEncoder().encode(secret);
}

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(payload.expiresAt / 1000))
    .sign(getKey());
}

export async function decryptSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string") return null;
    const role = payload.role === "EDITOR" ? "EDITOR" : "ADMIN";
    return { userId: payload.userId, role, expiresAt: Number(payload.expiresAt) };
  } catch {
    return null;
  }
}
