import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingHeader } from "@/components/listing/listing-header";
import { LocalNote } from "@/components/listing/local-note";
import { ProductListing } from "@/components/listing/product-listing";
import { getAncestors, getCategoryIndex, getDescendantIds } from "@/lib/catalog/categories";
import type { RawSearchParams } from "@/lib/catalog/filters";
import { loadListing } from "@/lib/catalog/listing";
import { categoryTitle, localDescription } from "@/lib/local-seo";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

type PageProps = { params: Promise<{ slug: string }>; searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ slug }, query, settings] = await Promise.all([params, searchParams, getSettings()]);
  const index = await getCategoryIndex();
  const category = index.bySlug.get(slug);
  if (!category) return {};
  return buildMetadata({
    title: category.seoTitle || categoryTitle(category.name, settings),
    description:
      category.seoDescription ||
      localDescription(category.description || category.tagline || `${category.name} modellerini ve fiyatlarını keşfedin.`, settings),
    path: `/kategori/${category.slug}`,
    image: category.bannerUrl || category.imageUrl,
    noIndex: Object.keys(query).length > 0,
  });
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const index = await getCategoryIndex();
  const category = index.bySlug.get(slug);
  if (!category) notFound();

  const ancestors = getAncestors(index, category);
  const data = await loadListing({
    scope: { categoryIds: getDescendantIds(category) },
    params: query,
    category,
    categoryOptions: category.children,
  });

  return (
    <>
      <ListingHeader
        breadcrumbs={[...ancestors, category].map((node) => ({ name: node.name, href: `/kategori/${node.slug}` }))}
        eyebrow={ancestors.at(-1)?.name ?? "Kategori"}
        title={category.name}
        description={category.description || category.tagline}
        imageUrl={category.bannerUrl || category.imageUrl}
        chips={category.children.map((child) => ({ label: child.name, href: `/kategori/${child.slug}`, imageUrl: child.imageUrl }))}
      />
      <ProductListing basePath={`/kategori/${category.slug}`} data={data} />
      <LocalNote subject={category.name} />
    </>
  );
}
