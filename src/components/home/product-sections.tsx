import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { ProductGrid } from "@/components/product/product-card";
import { buttonClass } from "@/components/ui/button-styles";
import { SectionHeading } from "@/components/ui/section-heading";
import { WhatsAppLink } from "@/components/whatsapp/whatsapp-link";
import { getProductsByFlag, parseSetItems, type ProductFlag } from "@/lib/catalog/products";
import { db } from "@/lib/db";
import { getProductWhatsAppHref } from "@/lib/whatsapp-server";

type ProductRailProps = {
  flag: ProductFlag;
  title: string;
  subtitle: string | null;
  eyebrow: string;
  href: string;
  take?: number;
  id: string;
};

export async function ProductRail({ flag, title, subtitle, eyebrow, href, take = 8, id }: ProductRailProps) {
  const products = await getProductsByFlag(flag, take);
  if (products.length === 0) return null;
  return (
    <section aria-labelledby={id} className="container-page pt-20 md:pt-28">
      <SectionHeading id={id} eyebrow={eyebrow} title={title} subtitle={subtitle} href={href} />
      <ProductGrid products={products} />
    </section>
  );
}

export async function FurnitureShowcase({ title, subtitle }: { title: string | null; subtitle: string | null }) {
  const sets = await db.product.findMany({
    where: { isActive: true, kind: "FURNITURE_SET" },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
    take: 3,
    include: { images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 }, brand: true },
  });
  const [hero, ...rest] = sets;
  if (!hero) return null;
  const items = parseSetItems(hero.setItems);
  const waHref = await getProductWhatsAppHref(hero);
  const image = hero.images[0];

  return (
    <section aria-labelledby="furniture-showcase" className="pt-20 md:pt-28">
      <div className="bg-sage-soft/70 py-16 md:py-24">
        <div className="container-page">
          <SectionHeading id="furniture-showcase" eyebrow="Bebek Odası & Mobilya" title={title || "Bebek Odası Koleksiyonu"} subtitle={subtitle} href="/kategori/bebek-odalari" linkLabel="Tüm bebek odaları" />
          <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
            <Link href={`/urun/${hero.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-cream">
              {image ? (
                <Image src={image.url} alt={image.alt || hero.name} fill sizes="(min-width: 1024px) 56vw, 100vw" className="object-cover transition-transform duration-[1200ms] ease-(--ease-soft) group-hover:scale-[1.03]" />
              ) : null}
            </Link>
            <div className="flex flex-col justify-center">
              {hero.brand ? <p className="eyebrow mb-3">{hero.brand.name}</p> : null}
              <h3 className="font-display text-[2rem] leading-[1.08] text-ink md:text-[2.5rem]">{hero.name}</h3>
              {hero.shortDescription ? <p className="mt-4 leading-relaxed text-ink-soft">{hero.shortDescription}</p> : null}
              {items.length ? (
                <ul className="mt-6 space-y-3 border-t border-sage/40 pt-6">
                  {items.map((item) => (
                    <li key={item.name} className="flex gap-3 text-sm">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-sage-deep text-ivory">
                        <Check className="size-3" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="font-medium text-ink">{item.name}</span>
                        {item.dimensions ? <span className="block text-ink-muted">{item.dimensions}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/urun/${hero.slug}`} className={buttonClass("primary", "lg", "group")}>
                  Bu Odayı İncele
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <WhatsAppLink href={waHref} label="Ölçü & Fiyat Sor" variant="secondary" size="lg" intent="info" />
              </div>
            </div>
          </div>

          {rest.length ? (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {rest.map((product) => (
                <li key={product.id}>
                  <Link href={`/urun/${product.slug}`} className="group flex items-center gap-5 rounded-2xl bg-ivory p-3 pr-6 transition-shadow hover:shadow-soft">
                    <span className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-xl bg-cream md:w-40">
                      {product.images[0] ? <Image src={product.images[0].url} alt="" fill sizes="160px" className="object-cover" /> : null}
                    </span>
                    <span>
                      <span className="block font-display text-xl leading-tight text-ink">{product.name}</span>
                      <span className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-soft group-hover:text-ink">
                        Bu Odayı İncele <ArrowRight className="size-3.5" aria-hidden="true" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
