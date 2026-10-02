import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ListingHeader } from "@/components/listing/listing-header";
import { ProductListing } from "@/components/listing/product-listing";
import { getCategoryIndex } from "@/lib/catalog/categories";
import type { RawSearchParams } from "@/lib/catalog/filters";
import { loadListing } from "@/lib/catalog/listing";
import { db } from "@/lib/db";
import { brandTitle, localDescription } from "@/lib/local-seo";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

type PageProps = { params: Promise<{ slug: string }>; searchParams: Promise<RawSearchParams> };

const getBrand = cache((slug: string) => db.brand.findFirst({ where: { slug, isActive: true } }));

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ slug }, query, settings] = await Promise.all([params, searchParams, getSettings()]);
  const brand = await getBrand(slug);
  if (!brand) return {};
  return buildMetadata({
    title: brand.seoTitle || brandTitle(brand.name, settings),
    description: brand.seoDescription || localDescription(brand.description || `${brand.name} markasının ürünlerini keşfedin.`, settings),
    path: `/marka/${brand.slug}`,
    image: brand.logoUrl,
    noIndex: Object.keys(query).length > 0,
  });
}

export default async function BrandPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const brand = await getBrand(slug);
  if (!brand) notFound();

  const index = await getCategoryIndex();
  const data = await loadListing({ scope: { brandId: brand.id }, params: query, categoryOptions: index.roots });

  return (
    <>
      <ListingHeader
        breadcrumbs={[
          { name: "Markalar", href: "/markalar" },
          { name: brand.name, href: `/marka/${brand.slug}` },
        ]}
        eyebrow="Marka"
        title={brand.name}
        description={brand.description}
      />
      <ProductListing basePath={`/marka/${brand.slug}`} data={data} />
    </>
  );
}
