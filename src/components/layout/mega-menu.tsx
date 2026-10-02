"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ChevronDown, ChevronRight, LayoutGrid } from "lucide-react";
import type { MenuBanner, MenuCategory } from "@/components/layout/menu-types";
import { cx } from "@/lib/cx";

const OPEN_DELAY = 90;
const CLOSE_DELAY = 180;

export function MegaMenu({ categories, banner }: { categories: MenuCategory[]; banner: MenuBanner }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const pathname = usePathname();

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const schedule = (next: boolean) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), next ? OPEN_DELAY : CLOSE_DELAY);
  };

  const active = categories[activeIndex] ?? categories[0];

  return (
    <div onMouseEnter={() => schedule(true)} onMouseLeave={() => schedule(false)}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={cx(
          "inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
          open ? "bg-ink text-ivory" : "bg-cream text-ink hover:bg-sand",
        )}
      >
        <LayoutGrid className="size-4" aria-hidden="true" />
        Kategoriler
        <ChevronDown className={cx("size-4 transition-transform duration-300", open && "rotate-180")} aria-hidden="true" />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full z-40 animate-fade-in border-t border-line bg-ivory shadow-lift"
      >
        <div className="container-page grid min-h-[460px] grid-cols-[260px_1fr_320px] gap-10 py-10 xl:grid-cols-[280px_1fr_360px]">
          <ul className="flex flex-col gap-0.5 border-r border-line pr-6" aria-label="Ana kategoriler">
            {categories.map((category, index) => (
              <li key={category.slug}>
                <Link
                  href={`/kategori/${category.slug}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  className={cx(
                    "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[0.92rem] transition-colors",
                    index === activeIndex ? "bg-cream font-medium text-ink" : "text-ink-soft hover:text-ink",
                  )}
                >
                  {category.name}
                  <ChevronRight className={cx("size-4 transition-opacity", index === activeIndex ? "opacity-100" : "opacity-0")} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          {active ? (
            <div key={active.slug} className="animate-fade-in">
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <p className="font-display text-[1.7rem] leading-tight text-ink">{active.name}</p>
                <Link href={`/kategori/${active.slug}`} className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:underline">
                  Tümünü Gör
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
              <ul className="grid grid-cols-2 gap-x-8 gap-y-1 xl:grid-cols-3">
                {active.children.map((child) => (
                  <li key={child.slug} className="break-inside-avoid">
                    <Link href={`/kategori/${child.slug}`} className="block rounded-lg py-2 text-[0.92rem] text-ink-soft transition-colors hover:text-ink">
                      {child.name}
                    </Link>
                    {child.children.length ? (
                      <ul className="mb-2 ml-3 border-l border-line pl-3">
                        {child.children.map((grandChild) => (
                          <li key={grandChild.slug}>
                            <Link href={`/kategori/${grandChild.slug}`} className="block py-1 text-sm text-ink-muted hover:text-ink">
                              {grandChild.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <MegaMenuFeature category={active} banner={banner} />
        </div>
      </div>
    </div>
  );
}

function MegaMenuFeature({ category, banner }: { category: MenuCategory | undefined; banner: MenuBanner }) {
  const image = category?.imageUrl ?? banner?.imageUrl;
  const href = category ? `/kategori/${category.slug}` : (banner?.href ?? "/urunler");
  if (!image) return <div />;
  return (
    <Link href={href} className="group relative block overflow-hidden rounded-2xl bg-cream">
      <Image src={image} alt="" fill sizes="360px" className="object-cover transition-transform duration-700 ease-(--ease-soft) group-hover:scale-105" />
      <span className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/10 to-transparent" aria-hidden="true" />
      <span className="absolute inset-x-0 bottom-0 p-6 text-ivory">
        <span className="eyebrow text-ivory/80">{category ? "Koleksiyon" : banner?.eyebrow}</span>
        <span className="mt-2 block font-display text-2xl leading-tight">{category?.tagline ?? banner?.title}</span>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium">
          Keşfet <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </span>
    </Link>
  );
}
