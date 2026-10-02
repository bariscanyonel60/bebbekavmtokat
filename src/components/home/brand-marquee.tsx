import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { db } from "@/lib/db";

export async function BrandMarquee({ title }: { title: string | null }) {
  const brands = await db.brand.findMany({ where: { isActive: true, isFeatured: true }, orderBy: { sortOrder: "asc" }, take: 24 });
  if (brands.length === 0) return null;
  const loop = [...brands, ...brands];

  return (
    <section aria-labelledby="brands" className="pt-20 md:pt-28">
      <div className="container-page">
        <SectionHeading id="brands" eyebrow="Markalar" title={title || "Seçkin Markalar"} href="/markalar" linkLabel="Tüm markalar" />
      </div>
      <div className="group relative overflow-hidden border-y border-line py-8 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <ul className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none">
          {loop.map((brand, index) => (
            <li key={`${brand.id}-${index}`} aria-hidden={index >= brands.length}>
              <Link
                href={`/marka/${brand.slug}`}
                tabIndex={index >= brands.length ? -1 : undefined}
                className="flex h-24 w-52 items-center justify-center rounded-2xl border border-line bg-white/60 px-6 text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
              >
                {brand.logoUrl ? (
                  <Image src={brand.logoUrl} alt={brand.name} width={140} height={56} className="max-h-12 w-auto object-contain grayscale transition hover:grayscale-0" />
                ) : (
                  <span className="font-display text-2xl tracking-tight">{brand.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
