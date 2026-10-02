"use client";

import { Heart } from "lucide-react";
import { toggleFavorite, useFavorites } from "@/lib/favorites";
import { cx } from "@/lib/cx";

export function FavoriteButton({ productId, productName, className, withLabel = false }: { productId: string; productName: string; className?: string; withLabel?: boolean }) {
  const favorites = useFavorites();
  const active = favorites.includes(productId);
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(productId)}
      aria-pressed={active}
      aria-label={withLabel ? undefined : active ? `${productName} favorilerden çıkar` : `${productName} favorilere ekle`}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full transition-colors duration-300",
        withLabel ? "h-11 border border-line-strong bg-white/70 px-5 text-sm font-medium hover:border-ink" : "size-9 bg-white/90 shadow-soft backdrop-blur hover:bg-white",
        className,
      )}
    >
      <Heart className={cx("size-[1.05rem] transition-colors", active ? "fill-rose-deep text-rose-deep" : "text-ink")} aria-hidden="true" />
      {withLabel ? (active ? "Favorilerde" : "Favorilere Ekle") : null}
    </button>
  );
}

export function FavoritesCount() {
  const favorites = useFavorites();
  if (favorites.length === 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 grid min-w-4.5 place-items-center rounded-full bg-rose-deep px-1 text-[0.62rem] font-semibold leading-4.5 text-white">
      {favorites.length}
      <span className="sr-only"> favori ürün</span>
    </span>
  );
}
