import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Banner, BannerPlacement } from "@prisma/client";
import { buttonClass } from "@/components/ui/button-styles";
import { db } from "@/lib/db";
import { cx } from "@/lib/cx";

function getBanners(placement: BannerPlacement, take: number) {
  return db.banner.findMany({ where: { placement, isActive: true }, orderBy: { sortOrder: "asc" }, take });
}

export async function CampaignBanner({ placement, reverse = false }: { placement: "HOME_PRIMARY" | "HOME_SECONDARY"; reverse?: boolean }) {
  const [banner] = await getBanners(placement, 1);
  if (!banner) return null;
  return (
    <section className="container-page pt-20 md:pt-28" aria-label={banner.title}>
      <div className={cx("grid overflow-hidden rounded-3xl bg-cream md:grid-cols-2", reverse && "md:[&>*:first-child]:order-2")}>
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[520px]">
          <Image src={banner.imageUrl} alt={banner.imageAlt || banner.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center p-8 md:p-14 xl:p-20">
          {banner.eyebrow ? <p className="eyebrow mb-4 text-sage-deep">{banner.eyebrow}</p> : null}
          <h2 className="font-display text-[2rem] leading-[1.08] tracking-tight text-ink md:text-5xl">{banner.title}</h2>
          {banner.description ? <p className="mt-5 max-w-md text-[1rem] leading-relaxed text-ink-soft">{banner.description}</p> : null}
          {banner.href ? (
            <Link href={banner.href} className={buttonClass("primary", "lg", "group mt-8 self-start")}>
              {banner.ctaLabel || "Koleksiyonu Keşfet"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SplitBannerCard({ banner }: { banner: Banner }) {
  const content = (
    <>
      <Image src={banner.imageUrl} alt={banner.imageAlt || ""} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-[1200ms] ease-(--ease-soft) group-hover:scale-[1.04]" />
      <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" aria-hidden="true" />
      <span className="absolute inset-x-0 bottom-0 p-7 text-ivory md:p-9">
        {banner.eyebrow ? <span className="eyebrow block text-ivory/80">{banner.eyebrow}</span> : null}
        <span className="mt-2 block font-display text-[1.75rem] leading-tight md:text-[2.2rem]">{banner.title}</span>
        {banner.description ? <span className="mt-2 block text-sm text-ivory/85">{banner.description}</span> : null}
        {banner.href ? (
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium">
            {banner.ctaLabel || "İncele"} <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        ) : null}
      </span>
    </>
  );
  const classes = "group relative block aspect-[4/3.2] overflow-hidden rounded-3xl bg-cream md:aspect-[5/4]";
  return banner.href ? (
    <Link href={banner.href} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}

export async function SplitBanners() {
  const banners = await getBanners("HOME_SPLIT", 3);
  if (banners.length === 0) return null;
  return (
    <section className="container-page pt-6 md:pt-8" aria-label="Kampanyalar">
      <ul className={cx("grid gap-4 md:gap-5", banners.length > 1 && "md:grid-cols-2", banners.length > 2 && "lg:grid-cols-3")}>
        {banners.map((banner) => (
          <li key={banner.id}>
            <SplitBannerCard banner={banner} />
          </li>
        ))}
      </ul>
    </section>
  );
}
