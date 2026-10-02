import type { Metadata } from "next";
import { ListingHeader } from "@/components/listing/listing-header";
import { ProductListing } from "@/components/listing/product-listing";
import { getCategoryIndex } from "@/lib/catalog/categories";
import type { RawSearchParams } from "@/lib/catalog/filters";
import { loadListing } from "@/lib/catalog/listing";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = { searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const metadata = await buildPageMetadata("campaigns", "/kampanyalar", {
    title: "Kampanyalı Bebek Ürünleri Tokat | Bebbek AVM",
    description: "Bebbek AVM Tokat mağazasındaki kampanyalı bebek arabası, bebek odası ve çocuk ürünlerini keşfedin.",
  });
  return Object.keys(await searchParams).length ? { ...metadata, robots: { index: false, follow: true } } : metadata;
}

export default async function CampaignsPage({ searchParams }: PageProps) {
  const [params, index] = await Promise.all([searchParams, getCategoryIndex()]);
  const data = await loadListing({ scope: { campaignOnly: true }, params, categoryOptions: index.roots });

  return (
    <>
      <ListingHeader
        breadcrumbs={[{ name: "Kampanyalar", href: "/kampanyalar" }]}
        eyebrow="Seçili ürünlerde"
        title="Kampanyalar"
        description="Mağazamızda kampanyalı olarak sunulan ürünler. Güncel fiyat ve stok bilgisi için WhatsApp üzerinden bize ulaşabilirsiniz."
      />
      <ProductListing basePath="/kampanyalar" data={data} hideCampaignToggle />
    </>
  );
}
