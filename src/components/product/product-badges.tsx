import { cx } from "@/lib/cx";

type BadgeFlags = { isNew: boolean; isBestSeller: boolean; isCampaign: boolean };

export function ProductBadges({ flags, className }: { flags: BadgeFlags; className?: string }) {
  const badges: { label: string; tone: string }[] = [];
  if (flags.isCampaign) badges.push({ label: "Kampanya", tone: "bg-rose-deep text-white" });
  if (flags.isNew) badges.push({ label: "Yeni", tone: "bg-brand-blue text-white" });
  if (flags.isBestSeller) badges.push({ label: "Çok Satan", tone: "bg-sage-deep text-white" });
  if (badges.length === 0) return null;
  return (
    <ul className={cx("flex flex-wrap gap-1.5", className)} aria-label="Ürün etiketleri">
      {badges.map((badge) => (
        <li key={badge.label} className={cx("rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] shadow-sm", badge.tone)}>
          {badge.label}
        </li>
      ))}
    </ul>
  );
}
