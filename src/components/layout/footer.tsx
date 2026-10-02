import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsAppIcon, YoutubeIcon } from "@/components/ui/brand-icons";
import { Logo } from "@/components/ui/logo";
import { getMenuCategories } from "@/lib/catalog/categories";
import { fullAddress } from "@/lib/local-seo";
import { getSettings, parseJsonSetting, type WorkingHour } from "@/lib/settings";
import { getGeneralWhatsAppHref } from "@/lib/whatsapp-server";

const CORPORATE = [
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Markalar", href: "/markalar" },
  { label: "Kampanyalar", href: "/kampanyalar" },
  { label: "İletişim", href: "/iletisim" },
];

const SERVICE = [
  { label: "Tüm Ürünler", href: "/urunler" },
  { label: "Favorilerim", href: "/favoriler" },
  { label: "Teslimat & Bilgi", href: "/iletisim" },
  { label: "KVKK Aydınlatma Metni", href: "/kvkk" },
];

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="eyebrow mb-4 text-ink">{title}</h2>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href} className="text-sm text-ink-soft transition-colors hover:text-ink">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function Footer() {
  const [settings, categories, waHref] = await Promise.all([getSettings(), getMenuCategories(), getGeneralWhatsAppHref()]);
  const hours = parseJsonSetting<WorkingHour[]>(settings.workingHours, []);
  const socials = [
    { href: settings.instagramUrl, label: "Instagram", Icon: InstagramIcon },
    { href: settings.facebookUrl, label: "Facebook", Icon: FacebookIcon },
    { href: settings.youtubeUrl, label: "YouTube", Icon: YoutubeIcon },
    { href: settings.tiktokUrl, label: "TikTok", Icon: TiktokIcon },
  ].filter((social) => social.href);

  return (
    <footer className="mt-24 bg-cream/60 md:mt-32">
      <div aria-hidden="true" className="flex h-1">
        <span className="flex-1 bg-brand-blue" />
        <span className="flex-1 bg-brand-pink" />
        <span className="flex-1 bg-brand-green" />
      </div>
      <div className="container-page grid gap-12 py-14 md:grid-cols-2 md:py-20 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.3fr]">
        <div className="max-w-sm">
          <Logo logoUrl={settings.logoUrl} siteName={settings.siteName} />
          <p className="mt-5 text-sm leading-relaxed text-ink-soft">{settings.footerDescription}</p>
          {socials.length ? (
            <ul className="mt-6 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-full border border-line-strong text-ink transition-colors hover:bg-ink hover:text-ivory">
                    <Icon className="size-[1.05rem]" />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <FooterColumn title="Kategoriler" links={categories.slice(0, 7).map((category) => ({ label: category.name, href: `/kategori/${category.slug}` }))} />
        <FooterColumn title="Kurumsal" links={CORPORATE} />
        <FooterColumn title="Müşteri Hizmetleri" links={SERVICE} />

        <div>
          <h2 className="eyebrow mb-4 text-ink">İletişim</h2>
          <ul className="space-y-3 text-sm text-ink-soft">
            {settings.address ? (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <address className="not-italic">{fullAddress(settings)}</address>
              </li>
            ) : null}
            {settings.phone ? (
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="hover:text-ink">
                  {settings.phone}
                </a>
              </li>
            ) : null}
            {waHref ? (
              <li className="flex gap-3">
                <WhatsAppIcon className="mt-0.5 size-4 shrink-0" />
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                  WhatsApp&apos;tan yazın
                </a>
              </li>
            ) : null}
            {settings.email ? (
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <a href={`mailto:${settings.email}`} className="hover:text-ink">
                  {settings.email}
                </a>
              </li>
            ) : null}
            {hours.length ? (
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  {hours.map((hour) => (
                    <span key={hour.label} className="block">
                      {hour.label}: {hour.value}
                    </span>
                  ))}
                </span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {settings.siteName}. Tüm hakları saklıdır.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li><Link href="/gizlilik-politikasi" className="hover:text-ink">Gizlilik Politikası</Link></li>
            <li><Link href="/kvkk" className="hover:text-ink">KVKK</Link></li>
            <li><Link href="/cerez-politikasi" className="hover:text-ink">Çerez Politikası</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
