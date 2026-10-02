import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ListingHeader } from "@/components/listing/listing-header";
import { db } from "@/lib/db";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("brands", "/markalar", {
    title: "Bebek ve Çocuk Markaları Tokat | Bebbek AVM",
    description: "Bebbek AVM Tokat mağazasında yer alan bebek ve çocuk markalarını keşfedin.",
  });
}

export default async function BrandsPage() {
  const brands = await db.brand.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });

  return (
    <>
      <ListingHeader
        breadcrumbs={[{ name: "Markalar", href: "/markalar" }]}
        eyebrow="Seçkin markalar"
        title="Markalar"
        description="Mağazamızda yer alan markaları inceleyin, ilgilendiğiniz markanın ürünlerine tek tıkla ulaşın."
      />
      <div className="container-page pb-24">
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
          {brands.map((brand) => (
            <li key={brand.id}>
              <Link
                href={`/marka/${brand.slug}`}
                className="group flex h-full flex-col justify-between gap-8 rounded-3xl border border-line bg-white/70 p-6 transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-soft md:p-7"
              >
                <span className="flex h-16 items-center">
                  {brand.logoUrl ? (
                    <span className="relative h-12 w-36">
                      <Image src={brand.logoUrl} alt={brand.name} fill sizes="144px" className="object-contain object-left" />
                    </span>
                  ) : (
                    <span className="font-display text-[1.7rem] leading-none tracking-tight text-ink">{brand.name}</span>
                  )}
                </span>
                <span className="flex items-end justify-between gap-4">
                  <span>
                    {brand.description ? <span className="line-clamp-2 text-sm text-ink-soft">{brand.description}</span> : null}
                    <span className="mt-2 block text-xs font-medium text-ink-muted">{brand._count.products} ürün</span>
                  </span>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-ink transition-transform duration-500 group-hover:rotate-45" aria-hidden="true">
                    <ArrowUpRight className="size-4" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
