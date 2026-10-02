import Link from "next/link";
import { Heart } from "lucide-react";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchOverlay } from "@/components/layout/search-overlay";
import type { MenuBanner, MenuCategory } from "@/components/layout/menu-types";
import { FavoritesCount } from "@/components/product/favorite-button";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { Logo } from "@/components/ui/logo";
import { getMenuCategories } from "@/lib/catalog/categories";
import { db } from "@/lib/db";
import { parseList, parseNavLinks } from "@/lib/nav";
import { getSettings, isTrue } from "@/lib/settings";
import { getGeneralWhatsAppHref } from "@/lib/whatsapp-server";

async function getMenuData(): Promise<{ categories: MenuCategory[]; banner: MenuBanner }> {
  const [roots, banner] = await Promise.all([
    getMenuCategories(),
    db.banner.findFirst({ where: { placement: "MEGA_MENU", isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return {
    categories: roots.map((root) => ({
      name: root.name,
      slug: root.slug,
      tagline: root.tagline,
      imageUrl: root.imageUrl,
      children: root.children
        .filter((child) => child.showInMenu)
        .map((child) => ({
          name: child.name,
          slug: child.slug,
          children: child.children.filter((grand) => grand.showInMenu).map((grand) => ({ name: grand.name, slug: grand.slug })),
        })),
    })),
    banner: banner
      ? { eyebrow: banner.eyebrow, title: banner.title, href: banner.href, ctaLabel: banner.ctaLabel, imageUrl: banner.imageUrl, imageAlt: banner.imageAlt }
      : null,
  };
}

export async function AnnouncementBar() {
  const settings = await getSettings();
  if (!isTrue(settings.announcementActive) || !settings.announcementText) return null;
  const waHref = await getGeneralWhatsAppHref();
  const href = settings.announcementHref || waHref;
  const content = (
    <>
      <WhatsAppIcon className="mr-2 inline size-3.5 align-[-2px]" />
      {settings.announcementText}
    </>
  );
  return (
    <div className="bg-brand-blue text-[0.78rem] text-white">
      <div className="container-page flex h-9 items-center justify-center text-center">
        {href ? (
          <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="block min-w-0 truncate underline-offset-4 hover:underline">
            {content}
          </a>
        ) : (
          <p className="min-w-0 truncate">{content}</p>
        )}
      </div>
    </div>
  );
}

export async function Header() {
  const [settings, { categories, banner }, waHref] = await Promise.all([getSettings(), getMenuData(), getGeneralWhatsAppHref()]);
  const links = parseNavLinks(settings.headerNavLinks);
  const popularSearches = parseList(settings.popularSearches);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-ivory/92 backdrop-blur-md supports-[backdrop-filter]:bg-ivory/85">
      <div className="container-page relative flex h-16 items-center gap-3 lg:h-20 lg:gap-6">
        <MobileNav categories={categories} links={links} whatsappHref={waHref} phone={settings.phone} />

        <Logo logoUrl={settings.logoUrl} siteName={settings.siteName} className="mr-auto lg:mr-0" />

        <nav aria-label="Ana menü" className="hidden flex-1 items-center gap-1 lg:flex">
          <MegaMenu categories={categories} banner={banner} />
          <ul className="flex min-w-0 items-center overflow-hidden">
            {links.map((link, index) => (
              <li key={link.href} className={index >= 4 ? "hidden 2xl:block" : index >= 2 ? "hidden xl:block" : undefined}>
                <Link href={link.href} className="inline-flex h-11 items-center whitespace-nowrap rounded-full px-3 text-sm text-ink-soft transition-colors hover:text-ink xl:px-3.5">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <SearchOverlay popularSearches={popularSearches} />
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-11 items-center gap-2 rounded-full border border-wa/15 bg-wa-soft px-4 text-sm font-medium text-wa transition-colors hover:bg-[#d4e8de] xl:inline-flex"
            >
              <WhatsAppIcon className="size-4" />
              WhatsApp
            </a>
          ) : null}
          <Link href="/favoriler" className="relative grid size-10 place-items-center rounded-full transition-colors hover:bg-cream" aria-label="Favorilerim">
            <Heart className="size-5" aria-hidden="true" />
            <FavoritesCount />
          </Link>
        </div>
      </div>
    </header>
  );
}
