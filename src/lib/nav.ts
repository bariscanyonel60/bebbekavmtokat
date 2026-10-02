export type NavLink = { label: string; href: string };

/** "Etiket|/link" satırlarını güvenli iç/dış linklere çevirir. */
export function parseNavLinks(value: string): NavLink[] {
  return value
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter(([label, href]) => Boolean(label && href && (href.startsWith("/") || href.startsWith("https://"))))
    .map(([label, href]) => ({ label, href }));
}

export function parseList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
