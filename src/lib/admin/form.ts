import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ActionState = { ok: boolean; message: string; errors?: Record<string, string> } | null;

export function str(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.replace(/\r\n?/g, "\n").trim() : "";
}

const RECORD_ID = /^[a-z0-9]{8,40}$/i;

/** `.bind()` ile istemciye giden id'ler geri gelirken tip garantisi taşımaz; sorguya girmeden doğrulanır. */
export function recordId(value: unknown): string {
  if (typeof value !== "string" || !RECORD_ID.test(value)) throw new Error("Geçersiz kayıt kimliği.");
  return value;
}

export function optionalRecordId(value: unknown): string | null {
  return value === null ? null : recordId(value);
}

export function optStr(form: FormData, key: string): string | null {
  return str(form, key) || null;
}

export function bool(form: FormData, key: string): boolean {
  const value = form.get(key);
  return value === "on" || value === "true" || value === "1";
}

export function int(form: FormData, key: string, fallback = 0): number {
  const parsed = Number.parseInt(str(form, key), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function decimal(form: FormData, key: string): number | null {
  const raw = str(form, key).replace(/\./g, "").replace(",", ".");
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function list(form: FormData, key: string): string[] {
  return form.getAll(key).filter((value): value is string => typeof value === "string" && value.length > 0);
}

/** Site içi yol ("/kategori/x") veya http(s) bağlantısı kabul eder. `javascript:` gibi şemaları reddeder. */
export const hrefSchema = z
  .string()
  .max(500)
  .refine((value) => value === "" || value.startsWith("/") || /^https?:\/\//i.test(value) || /^(mailto|tel):/i.test(value), "Geçerli bir bağlantı girin (/ ile başlayan yol veya https:// adresi).");

export const imageUrlSchema = z
  .string()
  .max(500)
  .refine(
    (value) => value === "" || (value.startsWith("/") && !value.startsWith("//")) || value.startsWith("https://res.cloudinary.com/"),
    "Görsel, panelden yüklenmeli ya da / veya https://res.cloudinary.com/ ile başlamalı.",
  );

export function zodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export function fail(message: string, errors?: Record<string, string>): ActionState {
  return { ok: false, message, errors };
}

/** Katalog/içerik değişince tüm public sayfaların ISR önbelleğini yeniler. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}

export function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "P2002";
}
