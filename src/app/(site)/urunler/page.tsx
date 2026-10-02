import type { Metadata } from "next";
import { ListingHeader } from "@/components/listing/listing-header";
import { ProductListing } from "@/components/listing/product-listing";
import { getCategoryIndex } from "@/lib/catalog/categories";
import { hasActiveFilters, parseFilters, type RawSearchParams } from "@/lib/catalog/filters";
import { loadListing } from "@/lib/catalog/listing";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = { searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const state = parseFilters(await searchParams);
  const metadata = await buildPageMetadata("products", "/urunler", {
    title: "Bebek ve Çocuk Ürünleri Tokat | Bebbek AVM",
    description: "Tokat'ta bebek arabası, oto koltuğu, bebek odası, beslenme ve bakım ürünleri. Bebbek AVM ürün kataloğunu inceleyin, WhatsApp'tan bilgi alın.",
  });
  if (hasActiveFilters(state) || state.sort !== "recommended" || state.page > 1) {
    return { ...metadata, robots: { index: false, follow: true } };
  }
  return metadata;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const index = await getCategoryIndex();
  const data = await loadListing({ scope: {}, params, categoryOptions: index.roots });
  const query = data.state.q;

  return (
    <>
      <ListingHeader
        breadcrumbs={[{ name: query ? "Arama" : "Tüm Ürünler", href: "/urunler" }]}
        eyebrow={query ? "Arama sonuçları" : "Katalog"}
        title={query ? `“${query}” için sonuçlar` : "Tüm Ürünler"}
        description={query ? null : "Bebeğinizin her dönemine eşlik eden, özenle seçilmiş ürünlerimizi keşfedin."}
        chips={query ? [] : index.roots.map((root) => ({ label: root.name, href: `/kategori/${root.slug}`, imageUrl: root.imageUrl }))}
      />
      <ProductListing basePath="/urunler" data={data} />
    </>
  );
}
