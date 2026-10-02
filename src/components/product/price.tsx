import type { StockStatus } from "@prisma/client";
import { formatPrice } from "@/lib/format";
import { cx } from "@/lib/cx";

type PriceProps = { price: number | null; salePrice: number | null; showPrice: boolean; size?: "sm" | "lg" };

export function Price({ price, salePrice, showPrice, size = "sm" }: PriceProps) {
  if (!showPrice || price === null) {
    return <p className={cx("text-ink-soft", size === "lg" ? "text-base" : "text-sm")}>Fiyat bilgisi için danışın</p>;
  }
  const hasSale = salePrice !== null && salePrice < price;
  return (
    <p className={cx("flex flex-wrap items-baseline gap-x-2.5", size === "lg" ? "text-2xl md:text-[1.75rem]" : "text-[0.95rem]")}>
      <span className={cx("font-semibold tracking-tight", hasSale ? "text-rose-deep" : "text-ink")}>
        {formatPrice(hasSale ? salePrice : price)}
      </span>
      {hasSale ? (
        <span className={cx("text-ink-muted line-through", size === "lg" ? "text-base" : "text-xs")}>
          <span className="sr-only">Önceki fiyat: </span>
          {formatPrice(price)}
        </span>
      ) : null}
    </p>
  );
}

export const STOCK_LABELS: Record<StockStatus, { label: string; tone: string }> = {
  IN_STOCK: { label: "Stokta", tone: "bg-sage-soft text-sage-deep" },
  LOW_STOCK: { label: "Sınırlı stok", tone: "bg-peach-soft text-rose-deep" },
  OUT_OF_STOCK: { label: "Tükendi", tone: "bg-sand text-ink-soft" },
  PRE_ORDER: { label: "Ön sipariş", tone: "bg-powder-soft text-brand-blue-deep" },
  ASK_STORE: { label: "Stok için danışın", tone: "bg-cream text-ink-soft" },
};

export function StockLabel({ status }: { status: StockStatus }) {
  const { label, tone } = STOCK_LABELS[status];
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", tone)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}
