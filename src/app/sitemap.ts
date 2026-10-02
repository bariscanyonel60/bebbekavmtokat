import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/settings";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [siteUrl, categories, products, brands, pages] = await Promise.all([
    getSiteUrl(),
    db.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    db.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true, images: { take: 1, orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], select: { url: true } } } }),
    db.brand.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    db.page.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  ]);
  const url = (path: string) => `${siteUrl}${path}`;
  const absolute = (path: string) => (/^https?:\/\//.test(path) ? path : url(path));

  return [
    { url: url("/"), changeFrequency: "daily", priority: 1 },
    { url: url("/urunler"), changeFrequency: "daily", priority: 0.9 },
    { url: url("/kampanyalar"), changeFrequency: "weekly", priority: 0.7 },
    { url: url("/markalar"), changeFrequency: "weekly", priority: 0.6 },
    { url: url("/hakkimizda"), changeFrequency: "monthly", priority: 0.5 },
    { url: url("/iletisim"), changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((category) => ({ url: url(`/kategori/${category.slug}`), lastModified: category.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((product) => ({
      url: url(`/urun/${product.slug}`),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: product.images.map((image) => absolute(image.url)),
    })),
    ...brands.map((brand) => ({ url: url(`/marka/${brand.slug}`), lastModified: brand.updatedAt, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...pages.map((page) => ({ url: url(`/${page.slug}`), lastModified: page.updatedAt, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
