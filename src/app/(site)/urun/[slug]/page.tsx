import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { StockStatus } from "@prisma/client";
import { Check, MessageCircle, Ruler, ShieldCheck, Truck } from "lucide-react";
import { FavoriteButton } from "@/components/product/favorite-button";
import { Price, StockLabel } from "@/components/product/price";
import { ProductBadges } from "@/components/product/product-badges";
import { ProductGrid } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { VariantPicker } from "@/components/product/variant-picker";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SectionHeading } from "@/components/ui/section-heading";
import { WhatsAppLink } from "@/components/whatsapp/whatsapp-link";
import { getAncestors, getCategoryIndex } from "@/lib/catalog/categories";
import { getProductBySlug, getRelatedProducts, parseRows, parseSetItems, toNumber, type ProductDetail } from "@/lib/catalog/products";
import { localDescription, productTitle } from "@/lib/local-seo";
import { absoluteUrl, buildMetadata, organizationId, serializeJsonLd } from "@/lib/seo";
import { getSettings, getSiteUrl } from "@/lib/settings";
import { getProductWhatsAppHref } from "@/lib/whatsapp-server";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const [{ slug }, settings] = await Promise.all([params, getSettings()]);
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return buildMetadata({
    title: product.seoTitle || productTitle(product.name, settings),
    description: product.seoDescription || localDescription(product.shortDescription || product.description, settings),
    path: `/urun/${product.slug}`,
    image: product.images[0]?.url,
  });
}

const SCHEMA_AVAILABILITY: Record<StockStatus, string> = {
  IN_STOCK: "https://schema.org/InStock",
  LOW_STOCK: "https://schema.org/LimitedAvailability",
  OUT_OF_STOCK: "https://schema.org/OutOfStock",
  PRE_ORDER: "https://schema.org/PreOrder",
  ASK_STORE: "https://schema.org/InStoreOnly",
};

function productJsonLd(product: ProductDetail, siteUrl: string) {
  const price = toNumber(product.salePrice) ?? toNumber(product.price);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.shortDescription || product.description || undefined,
    image: product.images.map((image) => absoluteUrl(siteUrl, image.url)),
    url: absoluteUrl(siteUrl, `/urun/${product.slug}`),
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    category: product.primaryCategory?.name,
    offers:
      product.showPrice && price !== null
        ? {
            "@type": "Offer",
            priceCurrency: "TRY",
            price: price.toFixed(2),
            availability: SCHEMA_AVAILABILITY[product.stockStatus],
            url: absoluteUrl(siteUrl, `/urun/${product.slug}`),
            seller: { "@id": organizationId(siteUrl) },
          }
        : undefined,
  };
}

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="space-y-4">
      {text
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
    </div>
  );
}

function RowsTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="divide-y divide-line rounded-2xl border border-line bg-white/60">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-4 py-3 text-sm">
          <dt className="text-ink-muted">{row.label}</dt>
          <dd className="font-medium text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Accordion({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-line">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[1.05rem] font-medium text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cream text-lg leading-none transition-transform duration-300 group-open:rotate-45" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="pb-6 text-[0.95rem] leading-relaxed text-ink-soft">{children}</div>
    </details>
  );
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [index, settings, siteUrl, infoHref, orderHref, related] = await Promise.all([
    getCategoryIndex(),
    getSettings(),
    getSiteUrl(),
    getProductWhatsAppHref(product, "info"),
    getProductWhatsAppHref(product, "order"),
    getRelatedProducts(product),
  ]);

  const primary = product.primaryCategory ? index.byId.get(product.primaryCategory.id) : undefined;
  const trail = primary ? [...getAncestors(index, primary), primary] : [];
  const isFurniture = product.kind === "FURNITURE_SET";
  const specs = parseRows(product.specs);
  const dimensions = parseRows(product.dimensions);
  const setItems = parseSetItems(product.setItems);
  const features = product.attributeValues.map((item) => ({ label: item.attributeValue.attribute.name, value: item.attributeValue.value }));
  const deliveryInfo = product.deliveryInfo || settings.deliveryInfo;
  const warrantyInfo = product.warrantyInfo || settings.warrantyInfo;
  const price = toNumber(product.price);
  const salePrice = toNumber(product.salePrice);

  return (
    <>
      <div className="container-page pb-28 pt-6 md:pt-8 lg:pb-24">
        <Breadcrumbs
          items={[
            ...trail.map((node) => ({ name: node.name, href: `/kategori/${node.slug}` })),
            { name: product.name, href: `/urun/${product.slug}` },
          ]}
        />

        <div className="mt-6 grid gap-8 md:mt-8 lg:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] lg:gap-12 xl:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProductGallery
              productName={product.name}
              images={product.images.map((image) => ({ url: image.url, alt: image.alt || product.name, width: image.width, height: image.height }))}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              {product.brand ? (
                <Link href={`/marka/${product.brand.slug}`} className="eyebrow text-ink hover:underline">
                  {product.brand.name}
                </Link>
              ) : null}
              <ProductBadges flags={product} />
            </div>
            <h1 className="mt-3 font-display text-[2rem] leading-[1.08] tracking-tight text-ink md:text-[2.6rem]">{product.name}</h1>
            <p className="mt-3 text-sm text-ink-muted">
              Ürün Kodu: <span className="font-medium text-ink-soft">{product.sku}</span>
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Price price={price} salePrice={salePrice} showPrice={product.showPrice} size="lg" />
              <StockLabel status={product.stockStatus} />
            </div>

            {product.shortDescription ? <p className="mt-6 text-[1.02rem] leading-relaxed text-ink-soft">{product.shortDescription}</p> : null}

            {product.variants.length ? (
              <div className="mt-7">
                <VariantPicker
                  variants={product.variants.map((variant) => ({
                    id: variant.id,
                    name: variant.name,
                    colorHex: variant.colorHex,
                    available: variant.stockStatus !== "OUT_OF_STOCK",
                  }))}
                />
              </div>
            ) : null}

            {product.ageRange || product.material ? (
              <dl className="mt-7 grid grid-cols-2 gap-3">
                {product.ageRange ? (
                  <div className="rounded-2xl bg-cream/80 px-4 py-3">
                    <dt className="text-xs text-ink-muted">Yaş aralığı</dt>
                    <dd className="mt-0.5 text-sm font-medium text-ink">{product.ageRange}</dd>
                  </div>
                ) : null}
                {product.material ? (
                  <div className="rounded-2xl bg-cream/80 px-4 py-3">
                    <dt className="text-xs text-ink-muted">Malzeme</dt>
                    <dd className="mt-0.5 text-sm font-medium text-ink">{product.material}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

            {isFurniture && setItems.length ? (
              <div className="mt-8 rounded-3xl bg-sage-soft/70 p-5 md:p-6">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Ruler className="size-4" aria-hidden="true" />
                  Takım içeriği
                </p>
                <ul className="mt-4 space-y-3">
                  {setItems.map((item) => (
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
              </div>
            ) : null}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <WhatsAppLink href={infoHref} label="WhatsApp'tan Bilgi Al" variant="whatsapp" size="lg" intent="info" className="w-full" />
              <WhatsAppLink href={orderHref} label={isFurniture ? "Ölçü & Sipariş Sor" : "WhatsApp ile Sipariş Ver"} variant="whatsapp-soft" size="lg" intent="order" className="w-full" />
            </div>
            <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
              <MessageCircle className="size-4 text-wa" aria-hidden="true" />
              Bu ürün hakkında uzmanımıza danışabilirsiniz.
            </p>
            <div className="mt-4">
              <FavoriteButton productId={product.id} productName={product.name} withLabel />
            </div>

            <ul className="mt-8 grid gap-3 border-t border-line pt-6 text-sm text-ink-soft sm:grid-cols-2">
              {deliveryInfo ? (
                <li className="flex gap-3">
                  <Truck className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden="true" />
                  <span className="line-clamp-3">{deliveryInfo}</span>
                </li>
              ) : null}
              {warrantyInfo ? (
                <li className="flex gap-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden="true" />
                  <span className="line-clamp-3">{warrantyInfo}</span>
                </li>
              ) : null}
            </ul>

            <div className="mt-8 border-t border-line">
              {product.description ? (
                <Accordion title="Ürün Açıklaması" open>
                  <Paragraphs text={product.description} />
                </Accordion>
              ) : null}
              {features.length ? (
                <Accordion title="Ürün Özellikleri">
                  <RowsTable rows={features} />
                </Accordion>
              ) : null}
              {specs.length ? (
                <Accordion title="Teknik Özellikler">
                  <RowsTable rows={specs} />
                </Accordion>
              ) : null}
              {dimensions.length ? (
                <Accordion title="Ölçüler">
                  <RowsTable rows={dimensions} />
                </Accordion>
              ) : null}
              {product.ageRange ? (
                <Accordion title="Yaş Aralığı">
                  <p>{product.ageRange}</p>
                </Accordion>
              ) : null}
              {deliveryInfo || warrantyInfo ? (
                <Accordion title="Teslimat & Garanti">
                  <div className="space-y-4">
                    {deliveryInfo ? (
                      <div>
                        <p className="font-medium text-ink">Teslimat</p>
                        <p className="mt-1 whitespace-pre-line">{deliveryInfo}</p>
                      </div>
                    ) : null}
                    {warrantyInfo ? (
                      <div>
                        <p className="font-medium text-ink">Garanti</p>
                        <p className="mt-1 whitespace-pre-line">{warrantyInfo}</p>
                      </div>
                    ) : null}
                  </div>
                </Accordion>
              ) : null}
            </div>
          </div>
        </div>

        {related.similar.length ? (
          <section aria-labelledby="similar-products" className="pt-20 md:pt-28">
            <SectionHeading id="similar-products" eyebrow="Önerilenler" title="Benzer Ürünler" />
            <ProductGrid products={related.similar.slice(0, 4)} />
          </section>
        ) : null}
        {related.sameCategory.length ? (
          <section aria-labelledby="same-category" className="pt-20 md:pt-28">
            <SectionHeading
              id="same-category"
              eyebrow={primary?.name ?? "Kategori"}
              title="Aynı Kategoriden"
              href={primary ? `/kategori/${primary.slug}` : undefined}
              linkLabel="Kategoriye git"
            />
            <ProductGrid products={related.sameCategory.slice(0, 4)} />
          </section>
        ) : null}
      </div>

      <div data-sticky-cta className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ivory/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-2 gap-2.5">
          <WhatsAppLink href={infoHref} label="Bilgi Al" variant="whatsapp" size="md" intent="info" className="w-full" />
          <WhatsAppLink href={orderHref} label="Sipariş Ver" variant="whatsapp-soft" size="md" intent="order" className="w-full" />
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd(product, siteUrl)) }} />
    </>
  );
}
