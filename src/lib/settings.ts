import { cache } from "react";
import { db } from "@/lib/db";
import { SETTING_DEFAULTS, type SettingKey, type SiteSettings } from "@/lib/settings-defaults";

export { SETTING_DEFAULTS, type SettingKey, type SiteSettings, type TrustItem, type WorkingHour } from "@/lib/settings-defaults";


export const getSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await db.siteSetting.findMany();
  const settings: SiteSettings = { ...SETTING_DEFAULTS };
  for (const row of rows) {
    if (row.key in SETTING_DEFAULTS) settings[row.key as SettingKey] = row.value;
  }
  return settings;
});

export function parseJsonSetting<T>(value: string, fallback: T): T {
  try {
    const parsed: unknown = JSON.parse(value);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function isTrue(value: string): boolean {
  return value === "true" || value === "1";
}

const PRODUCTION_SITE_URL = "https://bebbekavm.com";

export async function getSiteUrl(): Promise<string> {
  const settings = await getSettings();
  const fallback = process.env.NODE_ENV === "production" ? PRODUCTION_SITE_URL : "http://localhost:3000";
  const raw = settings.siteUrl || process.env.SITE_URL || fallback;
  return raw.replace(/\/+$/, "");
}
