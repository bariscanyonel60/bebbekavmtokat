import type { StockStatus } from "@prisma/client";
import { cx } from "@/lib/cx";

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
