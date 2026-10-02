import Link from "next/link";
import { MapPin, Navigation, Phone } from "lucide-react";
import { buttonClass } from "@/components/ui/button-styles";
import { WhatsAppLink } from "@/components/whatsapp/whatsapp-link";
import { getMenuCategories } from "@/lib/catalog/categories";
import { fullAddress } from "@/lib/local-seo";
import { getSettings } from "@/lib/settings";
import { getGeneralWhatsAppHref } from "@/lib/whatsapp-server";

/** Ana sayfanın H1'i: mağazanın şehrini, adresini ve ana kategorilerini görünür metinle anlatır. */
export async function LocalIntro({ title, subtitle }: { title: string | null; subtitle: string | null }) {
  const [settings, categories, waHref] = await Promise.all([getSettings(), getMenuCategories(), getGeneralWhatsAppHref()]);
  const address = fullAddress(settings);
  const heading = title || [settings.city, "Bebek ve Çocuk Mağazası"].filter(Boolean).join(" ");
  const intro =
    subtitle ||
    `${settings.siteName}; bebek arabası, oto koltuğu, beşik, bebek odası mobilyaları, mama sandalyesi ve anne-bebek bakım ürünlerini ${
      settings.cityLocative ? `${settings.cityLocative} ` : ""
    }tek mağazada sunar. Ürünleri mağazamızda yakından inceleyebilir, stok ve fiyat bilgisini WhatsApp'tan sorabilirsiniz.`;

  return (
    <section aria-labelledby="local-intro" className="container-page pt-14 md:pt-20">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-16">
        <div>
          {settings.city ? <p className="eyebrow mb-4 text-brand-blue">{[settings.district, settings.city].filter(Boolean).join(" · ")}</p> : null}
          <h1 id="local-intro" className="font-display text-[2.1rem] leading-[1.08] tracking-tight text-ink md:text-[2.9rem]">
            {heading}
          </h1>
          <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-ink-soft">{intro}</p>
          {categories.length ? (
            <ul className="mt-7 flex flex-wrap gap-2" aria-label="Ana kategoriler">
              {categories.slice(0, 8).map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/kategori/${category.slug}`}
                    className="inline-flex h-10 items-center rounded-full border border-line-strong bg-white/70 px-4 text-sm text-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {address ? (
          <div className="rounded-3xl border border-line bg-white/70 p-6 md:p-8">
            <div className="flex items-start gap-3 text-sm leading-relaxed text-ink">
              <MapPin className="mt-0.5 size-5 shrink-0 text-brand-pink" aria-hidden="true" />
              <div>
                <p className="font-semibold">{settings.siteName} Mağazası</p>
                <address className="not-italic text-ink-soft">{address}</address>
              </div>
            </div>
            {settings.phone ? (
              <p className="mt-4 flex items-center gap-3 text-sm">
                <Phone className="size-5 shrink-0 text-brand-pink" aria-hidden="true" />
                <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="font-medium text-ink hover:underline">
                  {settings.phone}
                </a>
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <WhatsAppLink href={waHref} label="WhatsApp'tan Yazın" size="md" />
              {settings.mapsLink ? (
                <a href={settings.mapsLink} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "md")}>
                  <Navigation className="size-4" aria-hidden="true" />
                  Yol Tarifi
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
