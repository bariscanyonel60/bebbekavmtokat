import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import type { BreadcrumbItem } from "@/lib/seo";

type ListingHeaderProps = {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  eyebrow?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  chips?: { label: string; href: string; imageUrl?: string | null }[];
};

export function ListingHeader({ breadcrumbs, title, eyebrow, description, imageUrl, chips = [] }: ListingHeaderProps) {
  return (
    <header className="container-page pb-8 pt-6 md:pb-10 md:pt-8">
      <Breadcrumbs items={breadcrumbs} />
      <div className={imageUrl ? "mt-6 grid items-center gap-6 md:grid-cols-[1fr_minmax(0,22rem)] lg:gap-12" : "mt-6"}>
        <div className="max-w-3xl">
          {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
          <h1 className="font-display text-[2.2rem] leading-[1.05] tracking-tight text-ink md:text-[3.2rem]">{title}</h1>
          {description ? <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft md:text-base">{description}</p> : null}
        </div>
        {imageUrl ? (
          <div className="relative hidden aspect-[4/3] overflow-hidden rounded-3xl bg-cream md:block">
            <Image src={imageUrl} alt="" fill sizes="22rem" preload className="object-cover" />
          </div>
        ) : null}
      </div>
      {chips.length ? (
        <nav aria-label="Alt kategoriler" className="mt-8">
          <ul className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
            {chips.map((chip) => (
              <li key={chip.href} className="shrink-0">
                <Link
                  href={chip.href}
                  className="inline-flex h-11 items-center gap-2.5 rounded-full border border-line-strong bg-white/70 pl-1.5 pr-4 text-sm text-ink transition-colors hover:border-ink hover:bg-white"
                >
                  {chip.imageUrl ? (
                    <span className="relative size-8 overflow-hidden rounded-full bg-cream">
                      <Image src={chip.imageUrl} alt="" fill sizes="32px" className="object-cover" />
                    </span>
                  ) : (
                    <span className="w-1.5" aria-hidden="true" />
                  )}
                  {chip.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
