import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { FavoriteButton } from "@/components/product/favorite-button";
import { ProductBadges } from "@/components/product/product-badges";
import type { ProductCardData } from "@/lib/catalog/products";
import { getProductWhatsAppHref } from "@/lib/whatsapp-server";

type ProductCardProps = {
  product: ProductCardData;
  sizes?: string;
  eager?: boolean;
};

export async function ProductCard({ product, sizes = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw", eager = false }: ProductCardProps) {
  const waHref = await getProductWhatsAppHref(product, "order");
  const href = `/urun/${product.slug}`;
  const isFurniture = product.kind === "FURNITURE_SET";

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[4/4.6] overflow-hidden rounded-2xl bg-cream">
        <Link href={href} className="absolute inset-0" tabIndex={-1} aria-hidden="true">
          {product.image ? (
            <>
              <Image
                src={product.image.url}
                alt={product.image.alt}
                fill
                sizes={sizes}
                loading={eager ? "eager" : "lazy"}
                className="object-cover transition-[transform,opacity] duration-700 ease-(--ease-soft) group-hover:scale-[1.04]"
              />
              {product.hoverImage ? (
                <Image
                  src={product.hoverImage.url}
                  alt=""
                  fill
                  sizes={sizes}
                  className="object-cover opacity-0 transition-opacity duration-700 ease-(--ease-soft) group-hover:opacity-100"
                />
              ) : null}
            </>
          ) : (
            <span className="grid h-full place-items-center text-ink-muted">
              <ImageOff className="size-8" aria-hidden="true" />
            </span>
          )}
        </Link>
        <ProductBadges flags={product} className="pointer-events-none absolute left-3 top-3" />
        <FavoriteButton productId={product.id} productName={product.name} className="absolute right-3 top-3" />
        {isFurniture ? (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-medium text-ink backdrop-blur">
            Oda Takımı
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        {product.brand ? <p className="eyebrow mb-1.5 text-[0.66rem]">{product.brand.name}</p> : null}
        <h3 className="text-[0.95rem] font-medium leading-snug text-ink">
          <Link href={href} className="line-clamp-2 decoration-line-strong underline-offset-4 hover:underline">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto pt-4">
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              data-wa-intent="order"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-wa px-4 text-[0.8rem] font-medium text-white shadow-soft transition-colors hover:bg-[#175a42]"
              aria-label={`${product.name} için WhatsApp ile sipariş ver (yeni sekmede açılır)`}
            >
              <WhatsAppIcon className="size-[1.1rem]" />
              Sipariş Ver
            </a>
          ) : (
            <Link
              href={href}
              className="inline-flex h-10 w-full items-center justify-center rounded-full border border-line-strong px-4 text-[0.8rem] font-medium text-ink transition-colors hover:border-ink hover:bg-white"
            >
              {isFurniture ? "Bu Odayı İncele" : "Ürünü İncele"}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

type ProductGridProps = { products: ProductCardData[]; eagerCount?: number; columns?: "full" | "listing" };

export function ProductGrid({ products, eagerCount = 0, columns = "full" }: ProductGridProps) {
  return (
    <ul className={`grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 ${columns === "full" ? "xl:grid-cols-4" : "2xl:grid-cols-4"}`}>
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} eager={index < eagerCount} />
        </li>
      ))}
    </ul>
  );
}
