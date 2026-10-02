import "server-only";
import { getSettings, getSiteUrl } from "@/lib/settings";
import { buildWhatsAppHref, fillTemplate, type WhatsAppIntent } from "@/lib/whatsapp";

export async function getProductWhatsAppHref(
  product: { name: string; sku: string; slug: string },
  intent: WhatsAppIntent = "info",
): Promise<string | null> {
  const [settings, siteUrl] = await Promise.all([getSettings(), getSiteUrl()]);
  const template = intent === "order" ? settings.whatsappOrderTemplate : settings.whatsappProductTemplate;
  const message = fillTemplate(template, { name: product.name, sku: product.sku, url: `${siteUrl}/urun/${product.slug}` });
  return buildWhatsAppHref(settings.whatsappNumber, message);
}

export async function getGeneralWhatsAppHref(message?: string): Promise<string | null> {
  const settings = await getSettings();
  return buildWhatsAppHref(settings.whatsappNumber, message ?? settings.whatsappGeneralMessage);
}
