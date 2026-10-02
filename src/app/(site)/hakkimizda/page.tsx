import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake, Sparkles, Store } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonClass } from "@/components/ui/button-styles";
import { WhatsAppLink } from "@/components/whatsapp/whatsapp-link";
import { buildPageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { getGeneralWhatsAppHref } from "@/lib/whatsapp-server";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("about", "/hakkimizda", {
    title: "Hakkımızda | Bebbek AVM Tokat",
    description: "Tokat Esentepe'deki Bebbek AVM'nin hikayesi, mağaza deneyimi ve bebek ürünleri seçimindeki yaklaşımı.",
  });
}

export default async function AboutPage() {
  const [settings, waHref] = await Promise.all([getSettings(), getGeneralWhatsAppHref()]);
  const pillars = [
    { Icon: Store, title: "Mağaza Deneyimi", text: settings.aboutStore },
    { Icon: Sparkles, title: "Ürün Seçim Yaklaşımımız", text: settings.aboutApproach },
    { Icon: HeartHandshake, title: "Müşteri Hizmeti", text: settings.aboutService },
  ].filter((pillar) => pillar.text);

  return (
    <>
      <div className="container-page pt-6 md:pt-8">
        <Breadcrumbs items={[{ name: "Hakkımızda", href: "/hakkimizda" }]} />
      </div>

      <section className="container-page grid items-center gap-10 pb-16 pt-10 md:pb-24 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow mb-4">Hakkımızda</p>
          <h1 className="font-display text-[2.4rem] leading-[1.04] tracking-tight text-ink md:text-[3.6rem]">{settings.aboutHeadline}</h1>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ink-soft">{settings.aboutStory}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/urunler" className={buttonClass("primary", "lg", "group")}>
              Ürünleri Keşfet
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <WhatsAppLink href={waHref} label="Bize Ulaşın" variant="secondary" size="lg" />
          </div>
        </div>
        <div className="grid grid-cols-5 gap-4">
          <div className="relative col-span-3 aspect-[3/4] overflow-hidden rounded-3xl bg-cream">
            <Image src="/images/demo/hero-nursery.jpg" alt="Bebek odası koleksiyonundan bir görünüm" fill preload sizes="(min-width: 1024px) 28vw, 60vw" className="object-cover" />
          </div>
          <div className="col-span-2 flex flex-col gap-4 pt-12">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-cream">
              <Image src="/images/demo/cat-toys.jpg" alt="Ahşap ve pelüş oyuncaklar" fill sizes="(min-width: 1024px) 18vw, 40vw" className="object-cover" />
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-cream">
              <Image src="/images/demo/cat-feeding.jpg" alt="Ahşap mama sandalyesi" fill sizes="(min-width: 1024px) 18vw, 40vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {pillars.length ? (
        <section aria-label="Yaklaşımımız" className="bg-sage-soft/60 py-16 md:py-24">
          <ul className="container-page grid gap-6 md:grid-cols-3 md:gap-8">
            {pillars.map(({ Icon, title, text }) => (
              <li key={title} className="rounded-3xl bg-ivory p-7 md:p-8">
                <span className="grid size-12 place-items-center rounded-full bg-sage-soft text-sage-deep">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h2 className="mt-6 font-display text-2xl text-ink">{title}</h2>
                <p className="mt-3 leading-relaxed text-ink-soft">{text}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
