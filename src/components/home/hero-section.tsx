import { getImageProps } from "next/image";
import { HeroSlider, type HeroSlideView } from "@/components/home/hero-slider";
import { db } from "@/lib/db";
import { getGeneralWhatsAppHref } from "@/lib/whatsapp-server";

export async function HeroSection() {
  const [slides, whatsappHref] = await Promise.all([
    db.heroSlide.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 6 }),
    getGeneralWhatsAppHref(),
  ]);
  if (slides.length === 0) return null;

  const views: HeroSlideView[] = slides.map((slide) => {
    const alt = slide.imageAlt || slide.title;
    const { props: desktop } = getImageProps({ src: slide.desktopImageUrl, alt, width: 1920, height: 850, sizes: "100vw", quality: 75 });
    const { props: mobile } = getImageProps({ src: slide.mobileImageUrl || slide.desktopImageUrl, alt, width: 900, height: 810, sizes: "100vw", quality: 75 });
    return {
      id: slide.id,
      eyebrow: slide.eyebrow,
      title: slide.title,
      description: slide.description,
      alt,
      desktop: { src: desktop.src, srcSet: desktop.srcSet, sizes: desktop.sizes, width: Number(desktop.width), height: Number(desktop.height) },
      mobile: { src: mobile.src, srcSet: mobile.srcSet, sizes: mobile.sizes, width: Number(mobile.width), height: Number(mobile.height) },
      primaryCtaLabel: slide.primaryCtaLabel,
      primaryCtaHref: slide.primaryCtaHref,
      showWhatsappCta: slide.showWhatsappCta,
    };
  });

  return <HeroSlider slides={views} whatsappHref={whatsappHref} />;
}
