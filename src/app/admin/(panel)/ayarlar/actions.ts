"use server";

import { z } from "zod";
import { fail, hrefSchema, imageUrlSchema, optStr, revalidateSite, str, type ActionState } from "@/lib/admin/form";
import { SEO_PAGE_KEYS, SETTING_GROUPS, type SettingField, type SettingGroup } from "@/lib/admin/settings-groups";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

const MAX_LENGTH = 5000;
const httpsUrl = z.url({ protocol: /^https$/ });

type Parsed = { ok: true; value: string } | { ok: false; error: string };

function parseLines(raw: string, parts: number): string[][] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (parts === 2 ? splitOnce(line, ":") : line.split("|").map((part) => part.trim())));
}

function splitOnce(line: string, separator: string): string[] {
  const index = line.indexOf(separator);
  return index < 0 ? [line, ""] : [line.slice(0, index).trim(), line.slice(index + 1).trim()];
}

function parseField(field: SettingField, form: FormData): Parsed {
  const raw = str(form, field.key);
  if (raw.length > MAX_LENGTH) return { ok: false, error: "Metin çok uzun." };
  switch (field.kind) {
    case "text":
    case "textarea":
      return { ok: true, value: raw };
    case "toggle":
      return { ok: true, value: form.get(field.key) === "on" ? "true" : "false" };
    case "select":
      return field.options?.some((option) => option.value === raw) ? { ok: true, value: raw } : { ok: false, error: "Geçersiz seçim." };
    case "image":
      return !raw || imageUrlSchema.safeParse(raw).success ? { ok: true, value: raw } : { ok: false, error: "Görseli yükleyin veya site içi bir yol girin." };
    case "url":
      return !raw || httpsUrl.safeParse(raw).success ? { ok: true, value: raw.replace(/\/+$/, "") } : { ok: false, error: "https:// ile başlayan geçerli bir adres girin." };
    case "href":
      return !raw || hrefSchema.safeParse(raw).success ? { ok: true, value: raw } : { ok: false, error: "Site içi (/...) veya https:// link girin." };
    case "email":
      return !raw || z.email().safeParse(raw).success ? { ok: true, value: raw } : { ok: false, error: "Geçerli bir e-posta girin." };
    case "phone":
      return !raw || normalizeWhatsAppNumber(raw).length >= 10 ? { ok: true, value: raw } : { ok: false, error: "Geçerli bir telefon numarası girin." };
    case "hours": {
      const rows = parseLines(raw, 2).map(([label, value]) => ({ label, value }));
      return rows.every((row) => row.label && row.value) ? { ok: true, value: JSON.stringify(rows) } : { ok: false, error: "Her satır “Gün: Saat” biçiminde olmalı." };
    }
    case "trust": {
      const rows = parseLines(raw, 3).map(([icon, title, description]) => ({ icon: icon ?? "", title: title ?? "", description: description ?? "" }));
      return rows.every((row) => row.icon && row.title) ? { ok: true, value: JSON.stringify(rows) } : { ok: false, error: "Her satır “ikon | başlık | açıklama” biçiminde olmalı." };
    }
    default: {
      const exhaustive: never = field.kind;
      return exhaustive;
    }
  }
}

export async function saveSettings(group: SettingGroup, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  if (!Object.hasOwn(SETTING_GROUPS, group)) return fail("Geçersiz ayar grubu.");
  const fields = SETTING_GROUPS[group].sections.flatMap((section) => section.fields);
  const values: { key: string; value: string }[] = [];
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const parsed = parseField(field, form);
    if (parsed.ok) values.push({ key: field.key, value: parsed.value });
    else errors[field.key] = parsed.error;
  }
  if (Object.keys(errors).length) return fail("Lütfen işaretli alanları düzeltin.", errors);

  await db.$transaction(values.map(({ key, value }) => db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } })));
  revalidateSite();
  return { ok: true, message: "Ayarlar kaydedildi." };
}

const seoPageSchema = z.object({
  title: z.string().max(190).nullable(),
  description: z.string().max(320).nullable(),
  ogImageUrl: imageUrlSchema.nullable(),
  noIndex: z.boolean(),
});

export async function saveSeoPages(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const rows: ({ key: string } & z.infer<typeof seoPageSchema>)[] = [];
  const errors: Record<string, string> = {};
  for (const page of SEO_PAGE_KEYS) {
    const parsed = seoPageSchema.safeParse({
      title: optStr(form, `${page.key}.title`),
      description: optStr(form, `${page.key}.description`),
      ogImageUrl: optStr(form, `${page.key}.ogImageUrl`),
      noIndex: form.get(`${page.key}.noIndex`) === "on",
    });
    if (parsed.success) rows.push({ key: page.key, ...parsed.data });
    else for (const issue of parsed.error.issues) errors[`${page.key}.${String(issue.path[0])}`] = issue.message;
  }
  if (Object.keys(errors).length) return fail("Lütfen işaretli alanları düzeltin.", errors);

  await db.$transaction(rows.map(({ key, ...data }) => db.seoSetting.upsert({ where: { key }, update: data, create: { key, ...data } })));
  revalidateSite();
  return { ok: true, message: "Sayfa SEO ayarları kaydedildi." };
}
