export type WhatsAppIntent = "info" | "order";

export type WhatsAppProduct = {
  name: string;
  sku: string;
  url: string;
};

/** "+90 (532) 000 00 00" → "905320000000". Başında 0 olan yerel numaralara 90 ekler. */
export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) return `9${digits}`;
  if (digits.length === 10 && digits.startsWith("5")) return `90${digits}`;
  return digits;
}

export function fillTemplate(template: string, product: WhatsAppProduct): string {
  return template
    .replaceAll("{PRODUCT_NAME}", product.name)
    .replaceAll("{SKU}", product.sku)
    .replaceAll("{PRODUCT_URL}", product.url);
}

/** wa.me mobilde uygulamayı, masaüstünde WhatsApp Web / Desktop'u açar. */
export function buildWhatsAppHref(number: string, message: string): string | null {
  const normalized = normalizeWhatsAppNumber(number);
  if (normalized.length < 10) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
