"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, ImageOff, X } from "lucide-react";
import type { FavoriteProduct } from "@/app/api/products/route";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { buttonClass } from "@/components/ui/button-styles";
import { toggleFavorite, useFavorites } from "@/lib/favorites";

type LoadState = { key: string; products: FavoriteProduct[] } | null;

export function FavoritesList() {
  const ids = useFavorites();
  const key = ids.join(",");
  const [loaded, setLoaded] = useState<LoadState>(null);

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    fetch(`/api/products?ids=${encodeURIComponent(key)}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : { products: [] }))
      .then((data: { products: FavoriteProduct[] }) => setLoaded({ key, products: data.products }))
      .catch(() => {});
    return () => controller.abort();
  }, [key]);

  if (!key) {
    return (
      <div className="flex flex-col items-center rounded-3xl bg-cream/70 px-6 py-20 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-ivory">
          <Heart className="size-6 text-rose-deep" aria-hidden="true" />
        </span>
        <h2 className="mt-5 font-display text-2xl text-ink">Henüz favori ürününüz yok</h2>
        <p className="mt-2 max-w-sm text-sm text-ink-soft">Beğendiğiniz ürünlerdeki kalp simgesine dokunarak burada saklayabilirsiniz. Favorileriniz yalnızca bu cihazda tutulur.</p>
        <Link href="/urunler" className={buttonClass("primary", "lg", "mt-7")}>
          Ürünleri Keşfet
        </Link>
      </div>
    );
  }

  const products = loaded?.key === key ? loaded.products.filter((product) => ids.includes(product.id)) : null;

  if (!products) {
    return (
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4" aria-busy="true" aria-label="Favoriler yükleniyor">
        {ids.slice(0, 4).map((id) => (
          <li key={id} className="animate-pulse">
            <div className="aspect-[4/4.6] rounded-2xl bg-cream" />
            <div className="mt-4 h-4 w-3/4 rounded bg-cream" />
            <div className="mt-2 h-4 w-1/3 rounded bg-cream" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-ink-soft" aria-live="polite">
        <span className="font-semibold text-ink">{products.length}</span> favori ürün
      </p>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <article className="group relative flex h-full flex-col">
              <div className="relative aspect-[4/4.6] overflow-hidden rounded-2xl bg-cream">
                <Link href={`/urun/${product.slug}`} className="absolute inset-0" tabIndex={-1} aria-hidden="true">
                  {product.image ? (
                    <Image src={product.image.url} alt={product.image.alt} fill sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  ) : (
                    <span className="grid h-full place-items-center text-ink-muted">
                      <ImageOff className="size-8" aria-hidden="true" />
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 shadow-soft backdrop-blur hover:bg-white"
                  aria-label={`${product.name} favorilerden çıkar`}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div className="flex flex-1 flex-col pt-4">
                {product.brand ? <p className="eyebrow mb-1.5 text-[0.66rem]">{product.brand.name}</p> : null}
                <h3 className="text-[0.95rem] font-medium leading-snug text-ink">
                  <Link href={`/urun/${product.slug}`} className="line-clamp-2 hover:underline">
                    {product.name}
                  </Link>
                </h3>
                <div className="mt-auto pt-4">
                  {product.orderHref ? (
                    <a
                      href={product.orderHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-wa-intent="order"
                      className={buttonClass("whatsapp", "sm", "w-full")}
                      aria-label={`${product.name} için WhatsApp ile sipariş ver (yeni sekmede açılır)`}
                    >
                      <WhatsAppIcon className="size-[1.1rem]" />
                      Sipariş Ver
                    </a>
                  ) : (
                    <Link href={`/urun/${product.slug}`} className={buttonClass("secondary", "sm", "w-full")}>
                      Ürünü İncele
                    </Link>
                  )}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}
