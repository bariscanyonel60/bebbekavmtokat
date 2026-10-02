import type { Metadata } from "next";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/brand-icons";
import { buttonClass } from "@/components/ui/button-styles";
import { WhatsAppLink } from "@/components/whatsapp/whatsapp-link";
import { fullAddress } from "@/lib/local-seo";
import { buildPageMetadata } from "@/lib/seo";
import { getSettings, parseJsonSetting, type WorkingHour } from "@/lib/settings";
import { getGeneralWhatsAppHref } from "@/lib/whatsapp-server";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("contact", "/iletisim", {
    title: "İletişim ve Yol Tarifi | Bebbek AVM Tokat",
    description: "Bebbek AVM Tokat mağazası: Esentepe Mah., Orhangazi Cd. No:102/A, Tokat Merkez. Telefon, WhatsApp ve yol tarifi bilgileri.",
  });
}

/** Yalnızca Google Maps embed adreslerine izin verilir; admin'e girilen keyfi bir URL iframe'e konmaz. */
function safeMapsEmbed(url: string): string | null {
  try {
    const parsed = new URL(url);
    const allowedHost = parsed.hostname === "www.google.com" || parsed.hostname === "maps.google.com";
    return parsed.protocol === "https:" && allowedHost && parsed.pathname.startsWith("/maps") ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  const [settings, waHref] = await Promise.all([getSettings(), getGeneralWhatsAppHref()]);
  const hours = parseJsonSetting<WorkingHour[]>(settings.workingHours, []);
  const mapsEmbed = settings.mapsEmbedUrl ? safeMapsEmbed(settings.mapsEmbedUrl) : null;
  const phoneHref = settings.phone ? `tel:${settings.phone.replace(/[^\d+]/g, "")}` : null;

  const cards = [
    settings.address
      ? { Icon: MapPin, title: "Mağaza Adresi", body: fullAddress(settings), href: settings.mapsLink || null, cta: "Yol tarifi al" }
      : null,
    settings.phone ? { Icon: Phone, title: "Telefon", body: settings.phone, href: phoneHref, cta: "Hemen ara" } : null,
    settings.email ? { Icon: Mail, title: "E-posta", body: settings.email, href: `mailto:${settings.email}`, cta: "E-posta gönder" } : null,
  ].filter((card) => card !== null);

  return (
    <div className="container-page pb-8 pt-6 md:pt-8">
      <Breadcrumbs items={[{ name: "İletişim", href: "/iletisim" }]} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <p className="eyebrow mb-4">İletişim</p>
          <h1 className="font-display text-[2.4rem] leading-[1.04] tracking-tight text-ink md:text-[3.4rem]">Size nasıl yardımcı olabiliriz?</h1>
          <p className="mt-5 max-w-lg text-[1.02rem] leading-relaxed text-ink-soft">
            Ürünler, stok durumu ve sipariş detayları için WhatsApp üzerinden yazabilir ya da mağazamızı ziyaret edebilirsiniz.
          </p>

          <div className="mt-8 rounded-3xl bg-wa-soft p-6 md:p-7">
            <p className="flex items-center gap-2 font-medium text-wa">
              <WhatsAppIcon className="size-5" />
              En hızlı iletişim kanalı
            </p>
            <p className="mt-2 text-sm text-ink-soft">Ürün linkini veya ürün kodunu paylaşarak uzman ekibimizden bilgi alabilirsiniz.</p>
            <WhatsAppLink href={waHref} label="WhatsApp'tan Yazın" variant="whatsapp" size="lg" className="mt-5" />
          </div>

          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {cards.map(({ Icon, title, body, href, cta }) => (
              <li key={title} className="rounded-3xl border border-line bg-white/60 p-6">
                <Icon className="size-5 text-ink" aria-hidden="true" />
                <p className="mt-4 text-sm font-semibold text-ink">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
                {href ? (
                  <a
                    href={href}
                    {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink underline-offset-4 hover:underline"
                  >
                    {cta}
                  </a>
                ) : null}
              </li>
            ))}
            {hours.length ? (
              <li className="rounded-3xl border border-line bg-white/60 p-6">
                <Clock className="size-5 text-ink" aria-hidden="true" />
                <p className="mt-4 text-sm font-semibold text-ink">Çalışma Saatleri</p>
                <dl className="mt-1 space-y-1 text-sm text-ink-soft">
                  {hours.map((hour) => (
                    <div key={hour.label} className="flex justify-between gap-4">
                      <dt>{hour.label}</dt>
                      <dd className="font-medium text-ink">{hour.value}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ) : null}
          </ul>
          {settings.instagramUrl ? (
            <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("ghost", "md", "mt-6 -ml-4")}>
              <InstagramIcon className="size-[1.1rem]" />
              {settings.instagramHandle ? `@${settings.instagramHandle}` : "Instagram"}
            </a>
          ) : null}
        </div>

        <div className="relative min-h-[22rem] overflow-hidden rounded-3xl bg-cream lg:min-h-full">
          {mapsEmbed ? (
            <iframe
              src={mapsEmbed}
              title="Mağaza konumu haritası"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full border-0"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-ivory text-ink">
                <Navigation className="size-6" aria-hidden="true" />
              </span>
              <p className="max-w-xs text-sm text-ink-soft">Harita, mağaza konumu admin panelinden eklendiğinde burada görünecek.</p>
              {settings.mapsLink ? (
                <a href={settings.mapsLink} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "md")}>
                  Haritada aç
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
