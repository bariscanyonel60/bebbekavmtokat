import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CampaignBanner, SplitBanners } from "@/components/home/banners";
import { BrandMarquee } from "@/components/home/brand-marquee";
import { EditorialCategoryGrid, PopularCategories } from "@/components/home/category-sections";
import { HeroSection } from "@/components/home/hero-section";
import { LocalIntro } from "@/components/home/local-intro";
import { FurnitureShowcase, ProductRail } from "@/components/home/product-sections";
import { SocialArea, TrustStrip, WhatsAppConsultation } from "@/components/home/service-sections";
import { db } from "@/lib/db";
import { buildPageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildPageMetadata("home", "/", { title: settings.defaultSeoTitle, description: settings.defaultSeoDescription });
}

type SectionConfig = { title: string | null; subtitle: string | null };

const SECTION_RENDERERS: Record<string, (config: SectionConfig) => ReactNode> = {
  hero: () => <HeroSection />,
  "local-intro": (config) => <LocalIntro {...config} />,
  "popular-categories": (config) => <PopularCategories {...config} />,
  "editorial-categories": (config) => <EditorialCategoryGrid {...config} />,
  featured: (config) => (
    <ProductRail id="featured" flag="isFeatured" eyebrow="Öne Çıkanlar" title={config.title || "Minikler İçin Seçtiklerimiz"} subtitle={config.subtitle} href="/urunler" take={8} />
  ),
  "banner-primary": () => <CampaignBanner placement="HOME_PRIMARY" />,
  "best-sellers": (config) => (
    <ProductRail id="best-sellers" flag="isBestSeller" eyebrow="Çok Satanlar" title={config.title || "Çok Satanlar"} subtitle={config.subtitle} href="/urunler" take={4} />
  ),
  "furniture-showcase": (config) => <FurnitureShowcase {...config} />,
  "banner-secondary": () => <CampaignBanner placement="HOME_SECONDARY" reverse />,
  "split-banners": () => <SplitBanners />,
  "new-arrivals": (config) => (
    <ProductRail id="new-arrivals" flag="isNew" eyebrow="Yeni" title={config.title || "Yeni Gelenler"} subtitle={config.subtitle} href="/urunler?new=1" take={4} />
  ),
  brands: (config) => <BrandMarquee {...config} />,
  "whatsapp-cta": (config) => <WhatsAppConsultation {...config} />,
  trust: () => <TrustStrip />,
  social: (config) => <SocialArea {...config} />,
};

export default async function HomePage() {
  const [sections, settings] = await Promise.all([
    db.homeSection.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    getSettings(),
  ]);
  const localIntroRendersH1 = sections.some((section) => section.key === "local-intro");
  return (
    <>
      {localIntroRendersH1 ? null : <h1 className="sr-only">{`${settings.siteName} – ${settings.siteTagline}`}</h1>}
      {sections.map((section) => {
        const render = SECTION_RENDERERS[section.key];
        return render ? <div key={section.id}>{render({ title: section.title, subtitle: section.subtitle })}</div> : null;
      })}
    </>
  );
}
