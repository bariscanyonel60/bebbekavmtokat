const TR_MAP: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  i̇: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

/** Türkçe karakterleri ASCII karşılıklarına çevirip küçük harfe indirir. */
export function normalizeText(input: string): string {
  return input
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşüâîû]|i̇/g, (ch) => TR_MAP[ch] ?? ch)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** "Travel Sistem Bebek Arabaları" → "travel-sistem-bebek-arabalari" */
export function slugify(input: string): string {
  return normalizeText(input).replace(/\s+/g, "-").slice(0, 120);
}

export function searchTokens(query: string): string[] {
  return normalizeText(query)
    .split(" ")
    .filter((token) => token.length > 0)
    .slice(0, 6);
}

export function truncate(input: string, max: number): string {
  if (input.length <= max) return input;
  return `${input.slice(0, max - 1).trimEnd()}…`;
}
