import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getSettings, getSiteUrl } from "@/lib/settings";
import { truncate } from "@/lib/text";

type BuildMetadataInput = {
  title?: string | null;
  description?: string | null;
  path: string;
  image?: string | null;
  noIndex?: boolean;
  type?: "website" | "article";
};

/** Organization/Store JSON-LD düğümlerinin sabit kimlikleri; ürün teklifleri satıcı olarak buna bağlanır. */
export const organizationId = (siteUrl: string) => `${siteUrl}/#organization`;
export const storeId = (siteUrl: string) => `${siteUrl}/#store`;

export function absoluteUrl(siteUrl: string, pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export async function buildMetadata(input: BuildMetadataInput): Promise<Metadata> {
  const [settings, siteUrl] = await Promise.all([getSettings(), getSiteUrl()]);
  const title = input.title || settings.defaultSeoTitle;
  const description = truncate(input.description || settings.defaultSeoDescription, 160);
  const image = absoluteUrl(siteUrl, input.image || settings.defaultOgImageUrl);
  const canonical = absoluteUrl(siteUrl, input.path);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: input.noIndex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: input.type ?? "website",
      locale: "tr_TR",
      siteName: settings.siteName,
      url: canonical,
      title,
      description,
      images: [{ url: image }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

/** Admin panelindeki SEO ayarlarından statik sayfa metadata'sı üretir. */
export async function buildPageMetadata(key: string, path: string, fallback: { title: string; description: string }) {
  const seo = await db.seoSetting.findUnique({ where: { key } });
  return buildMetadata({
    title: seo?.title || fallback.title,
    description: seo?.description || fallback.description,
    image: seo?.ogImageUrl,
    noIndex: seo?.noIndex,
    path,
  });
}

export type BreadcrumbItem = { name: string; href: string };

export function breadcrumbJsonLd(siteUrl: string, items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(siteUrl, item.href),
    })),
  };
}

/** JSON-LD'yi script içine güvenli şekilde gömmek için `<` karakterini kaçırır. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
