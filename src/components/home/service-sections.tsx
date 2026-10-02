import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, HeartHandshake, MessagesSquare, Store, Truck, type LucideIcon } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/brand-icons";
import { buttonClass } from "@/components/ui/button-styles";
import { WhatsAppLink } from "@/components/whatsapp/whatsapp-link";
import { db } from "@/lib/db";
import { getSettings, parseJsonSetting, type TrustItem } from "@/lib/settings";
import { getGeneralWhatsAppHref } from "@/lib/whatsapp-server";

const TRUST_ICONS: Record<string, LucideIcon> = {
  "badge-check": BadgeCheck,
  "messages-square": MessagesSquare,
  store: Store,
  truck: Truck,
  heart: HeartHandshake,
};

export async function WhatsAppConsultation({ title, subtitle }: { title: string | null; subtitle: string | null }) {
  const [settings, href] = await Promise.all([getSettings(), getGeneralWhatsAppHref()]);
  return (
    <section className="container-page pt-20 md:pt-28" aria-labelledby="whatsapp-cta">
      <div className="relative overflow-hidden rounded-3xl bg-peach-soft px-6 py-14 text-center md:px-16 md:py-20">
        <div className="absolute -left-16 -top-16 size-64 rounded-full bg-peach/50 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-20 -right-10 size-72 rounded-full bg-sage-soft blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-2xl">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-white text-wa shadow-soft">
            <WhatsAppIcon className="size-7" />
          </span>
          <h2 id="whatsapp-cta" className="mt-6 font-display text-[2rem] leading-[1.1] tracking-tight text-ink md:text-[2.75rem]">
            {title || "Doğru ürünü birlikte seçelim"}
          </h2>
          {subtitle ? <p className="mx-auto mt-4 max-w-lg leading-relaxed text-ink-soft">{subtitle}</p> : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <WhatsAppLink href={href} label="WhatsApp'tan Danışın" size="lg" />
            {settings.phone ? (
              <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className={buttonClass("secondary", "lg")}>
                {settings.phone}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export async function TrustStrip() {
  const settings = await getSettings();
  const items = parseJsonSetting<TrustItem[]>(settings.trustItems, []);
  if (items.length === 0) return null;
  return (
    <section className="container-page pt-20 md:pt-24" aria-label="Hizmetlerimiz">
      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 border-y border-line py-10 md:py-12 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = TRUST_ICONS[item.icon];
          return (
            <li key={item.title} className="flex flex-col items-center gap-3 text-center md:flex-row md:items-start md:text-left">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-cream text-ink">
                {Icon ? <Icon className="size-5" aria-hidden="true" /> : <WhatsAppIcon className="size-5" />}
              </span>
              <span>
                <span className="block text-[0.92rem] font-semibold text-ink">{item.title}</span>
                <span className="mt-1 block text-sm leading-snug text-ink-soft">{item.description}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export async function SocialArea({ title, subtitle }: { title: string | null; subtitle: string | null }) {
  const settings = await getSettings();
  if (!settings.instagramUrl) return null;
  const images = await db.productImage.findMany({
    where: { isPrimary: true, product: { isActive: true } },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, url: true },
  });
  return (
    <section className="container-page pt-20 md:pt-28" aria-labelledby="social">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-3">{settings.instagramHandle ? `@${settings.instagramHandle}` : "Instagram"}</p>
          <h2 id="social" className="font-display text-[1.85rem] leading-[1.1] tracking-tight md:text-[2.6rem]">
            {title || "Bizi Instagram'da Takip Edin"}
          </h2>
          {subtitle ? <p className="mt-3 text-ink-soft">{subtitle}</p> : null}
        </div>
        <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "md")}>
          <InstagramIcon className="size-4" /> Takip Et
        </a>
      </div>
      <ul className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-4">
        {images.map((image) => (
          <li key={image.id}>
            <Link href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square overflow-hidden rounded-2xl bg-cream" aria-label="Instagram profilimiz">
              <Image src={image.url} alt="" fill sizes="(min-width: 768px) 16vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
