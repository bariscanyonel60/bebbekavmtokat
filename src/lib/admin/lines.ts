import type { SetItem, SpecRow } from "@/lib/catalog/products";

/** Admin formlarındaki satır bazlı metin alanlarını yapısal veriye çevirir (ve tersini yapar). */

const lines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

/** "Etiket: Değer" satırları */
export function parseRowsText(text: string): SpecRow[] {
  return lines(text).flatMap((line) => {
    const index = line.indexOf(":");
    if (index <= 0) return [];
    const label = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    return label && value ? [{ label, value }] : [];
  });
}

export function rowsToText(rows: SpecRow[]): string {
  return rows.map((row) => `${row.label}: ${row.value}`).join("\n");
}

/** "Parça adı | Ölçü" satırları */
export function parseSetItemsText(text: string): SetItem[] {
  return lines(text).map((line) => {
    const [name, dimensions = ""] = line.split("|").map((part) => part.trim());
    return { name, dimensions };
  });
}

export function setItemsToText(items: SetItem[]): string {
  return items.map((item) => (item.dimensions ? `${item.name} | ${item.dimensions}` : item.name)).join("\n");
}

export type VariantLine = { name: string; colorHex: string | null };

/** "Seçenek adı | #renkkodu" satırları */
export function parseVariantsText(text: string): VariantLine[] {
  return lines(text).map((line) => {
    const [name, color = ""] = line.split("|").map((part) => part.trim());
    return { name, colorHex: /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : null };
  });
}

export function variantsToText(variants: VariantLine[]): string {
  return variants.map((variant) => (variant.colorHex ? `${variant.name} | ${variant.colorHex}` : variant.name)).join("\n");
}
