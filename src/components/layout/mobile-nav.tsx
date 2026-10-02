"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, Menu, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import type { MenuCategory } from "@/components/layout/menu-types";
import type { NavLink } from "@/lib/nav";

type MobileNavProps = {
  categories: MenuCategory[];
  links: NavLink[];
  whatsappHref: string | null;
  phone: string;
};

export function MobileNav({ categories, links, whatsappHref, phone }: MobileNavProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  const active = categories.find((category) => category.slug === activeSlug);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="grid size-10 place-items-center rounded-full hover:bg-cream lg:hidden"
        aria-label="Menüyü aç"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Site menüsü"
        className="m-0 h-dvh max-h-none w-full max-w-none bg-ivory p-0 text-ink backdrop:bg-ink/30"
        onClose={() => setActiveSlug(null)}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-line px-5">
            {active ? (
              <button type="button" onClick={() => setActiveSlug(null)} className="inline-flex items-center gap-2 text-sm font-medium">
                <ArrowLeft className="size-4" aria-hidden="true" /> Tüm kategoriler
              </button>
            ) : (
              <p className="font-display text-xl">Menü</p>
            )}
            <button type="button" onClick={close} className="grid size-10 place-items-center rounded-full hover:bg-cream" aria-label="Menüyü kapat">
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            {active ? (
              <div key={active.slug} className="animate-fade-in">
                <p className="font-display text-[1.7rem] leading-tight">{active.name}</p>
                <Link href={`/kategori/${active.slug}`} className="mt-2 inline-block text-sm font-medium underline underline-offset-4">
                  Tüm {active.name} ürünleri
                </Link>
                <ul className="mt-6 divide-y divide-line">
                  {active.children.map((child) => (
                    <li key={child.slug}>
                      <Link href={`/kategori/${child.slug}`} className="flex items-center justify-between py-3.5 text-[0.95rem]">
                        {child.name}
                        <ChevronRight className="size-4 text-ink-muted" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="animate-fade-in">
                <p className="eyebrow mb-2">Kategoriler</p>
                <ul className="divide-y divide-line">
                  {categories.map((category) => (
                    <li key={category.slug}>
                      {category.children.length ? (
                        <button type="button" onClick={() => setActiveSlug(category.slug)} className="flex w-full items-center justify-between py-3.5 text-left text-[1.02rem]">
                          {category.name}
                          <ChevronRight className="size-4 text-ink-muted" aria-hidden="true" />
                        </button>
                      ) : (
                        <Link href={`/kategori/${category.slug}`} className="block py-3.5 text-[1.02rem]">
                          {category.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="eyebrow mb-2 mt-8">Keşfet</p>
                <ul className="grid grid-cols-2 gap-2">
                  {[{ label: "Tüm Ürünler", href: "/urunler" }, ...links, { label: "Favorilerim", href: "/favoriler" }, { label: "İletişim", href: "/iletisim" }].map((link) => (
                    <li key={link.href + link.label}>
                      <Link href={link.href} className="block rounded-xl bg-cream px-4 py-3 text-sm">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="border-t border-line p-5">
            {whatsappHref ? (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-full bg-wa text-sm font-medium text-white">
                <WhatsAppIcon className="size-5" /> WhatsApp&apos;tan Bilgi Al
              </a>
            ) : null}
            {phone ? (
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="mt-3 block text-center text-sm text-ink-soft">
                {phone}
              </a>
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}
