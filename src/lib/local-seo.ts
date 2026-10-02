import type { SiteSettings } from "@/lib/settings-defaults";
import { truncate } from "@/lib/text";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

const DESCRIPTION_MAX = 160;

function mentionsCity(text: string, settings: SiteSettings): boolean {
  return Boolean(settings.city) && text.toLocaleLowerCase("tr").includes(settings.city.toLocaleLowerCase("tr"));
}

/** "60100 Tokat Merkez/Tokat" */
export function localityLine(settings: SiteSettings): string {
  const place = [settings.district, settings.city].filter(Boolean).join("/");
  return [settings.postalCode, place].filter(Boolean).join(" ");
}

export function fullAddress(settings: SiteSettings): string {
  return [settings.address, localityLine(settings)].filter(Boolean).join(", ");
}

/** Telefonu schema.org için +90... biçimine çevirir. */
export function phoneE164(phone: string): string | undefined {
  const digits = normalizeWhatsAppNumber(phone);
  return digits.length >= 10 ? `+${digits}` : undefined;
}

/** "Tokat Bebek Arabaları | Bebbek AVM" */
export function categoryTitle(name: string, settings: SiteSettings): string {
  const main = settings.city && !mentionsCity(name, settings) ? `${settings.city} ${name}` : name;
  return `${main} | ${settings.siteName}`;
}

/** "Ürün Adı | Bebbek AVM Tokat" */
export function productTitle(name: string, settings: SiteSettings): string {
  return `${name} | ${[settings.siteName, settings.city].filter(Boolean).join(" ")}`;
}

/** "Marka Ürünleri Tokat | Bebbek AVM" */
export function brandTitle(name: string, settings: SiteSettings): string {
  return `${[`${name} Ürünleri`, settings.city].filter(Boolean).join(" ")} | ${settings.siteName}`;
}

/** Açıklama şehri anmıyorsa sonuna kısa bir yerel cümle ekler; toplam uzunluk 160 karakteri geçmez. */
export function localDescription(text: string | null | undefined, settings: SiteSettings): string {
  const base = (text ?? "").replace(/\s+/g, " ").trim();
  if (!settings.cityLocative || mentionsCity(base, settings)) return truncate(base, DESCRIPTION_MAX);
  const suffix = `${settings.cityLocative} ${settings.siteName} mağazasında inceleyin.`;
  if (!base) return suffix;
  return `${fitSentences(base, DESCRIPTION_MAX - suffix.length - 1)} ${suffix}`;
}

/** Metni mümkünse son tam cümlede keser; tek cümle bile sığmıyorsa üç noktayla kısaltır. */
function fitSentences(text: string, max: number): string {
  if (text.length <= max) return text;
  const end = text.lastIndexOf(". ", max - 1);
  return end > max / 3 ? text.slice(0, end + 1) : truncate(text, max);
}
