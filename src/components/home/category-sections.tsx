import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { getHomeFeaturedCategories, getPopularCategories } from "@/lib/catalog/categories";
import { cx } from "@/lib/cx";

type SectionProps = { title: string | null; subtitle: string | null };

export async function PopularCategories({ title }: SectionProps) {
  const categories = await getPopularCategories();
  if (categories.length === 0) return null;
  return (
    <section aria-labelledby="popular-categories" className="container-page pt-12 md:pt-16">
      <h2 id="popular-categories" className="sr-only">
        {title || "Popüler Kategoriler"}
      </h2>
      <ul className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-5 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-9">
        {categories.map((category) => (
          <li key={category.id} className="w-[6.5rem] shrink-0 snap-start md:w-auto">
            <Link href={`/kategori/${category.slug}`} className="group flex flex-col items-center gap-3 text-center">
              <span className="relative block aspect-square w-full overflow-hidden rounded-full bg-cream ring-1 ring-line transition-shadow duration-500 group-hover:ring-ink/30">
                {category.imageUrl ? (
                  <Image src={category.imageUrl} alt="" fill sizes="(min-width: 1024px) 10vw, (min-width: 768px) 18vw, 104px" className="object-cover transition-transform duration-700 ease-(--ease-soft) group-hover:scale-110" />
                ) : null}
              </span>
              <span className="text-[0.82rem] font-medium leading-tight text-ink">{category.popularLabel || category.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const EDITORIAL_LAYOUT = [
  "md:col-span-7 md:row-span-2 aspect-[4/5] md:aspect-auto",
  "md:col-span-5 aspect-[4/3] md:aspect-auto",
  "md:col-span-5 aspect-[4/3] md:aspect-auto",
  "md:col-span-5 aspect-[4/3] md:aspect-auto",
  "md:col-span-7 aspect-[4/3] md:aspect-auto",
  "md:col-span-12 aspect-[4/3] md:aspect-auto",
];

export async function EditorialCategoryGrid({ title, subtitle }: SectionProps) {
  const categories = (await getHomeFeaturedCategories()).slice(0, 6);
  if (categories.length === 0) return null;
  return (
    <section aria-labelledby="editorial-categories" className="container-page pt-20 md:pt-28">
      <SectionHeading id="editorial-categories" eyebrow="Kategoriler" title={title || "İhtiyacınız Olan Her Şey"} subtitle={subtitle} href="/urunler" linkLabel="Tüm ürünler" />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:auto-rows-[290px] md:grid-cols-12 md:gap-5 xl:auto-rows-[330px]">
        {categories.map((category, index) => (
          <li key={category.id} className={cx("relative", EDITORIAL_LAYOUT[index] ?? "md:col-span-6 aspect-[4/3]", index === 0 && "sm:col-span-2 md:col-span-7")}>
            <Link href={`/kategori/${category.slug}`} className="group absolute inset-0 overflow-hidden rounded-3xl bg-cream">
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt=""
                  fill
                  sizes={index === 0 ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 42vw, 100vw"}
                  className="object-cover transition-transform duration-[1200ms] ease-(--ease-soft) group-hover:scale-[1.05]"
                />
              ) : null}
              <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-transparent" aria-hidden="true" />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-ivory md:p-8">
                <span>
                  <span className={cx("block font-display leading-[1.05]", index === 0 ? "text-3xl md:text-[2.75rem]" : "text-2xl md:text-[1.9rem]")}>{category.name}</span>
                  {category.tagline ? <span className="mt-2 block max-w-sm text-sm text-ivory/85 md:text-[0.95rem]">{category.tagline}</span> : null}
                </span>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ivory/95 text-ink transition-transform duration-500 group-hover:rotate-45" aria-hidden="true">
                  <ArrowUpRight className="size-5" />
                </span>
              </span>
              <span className="sr-only">Keşfet</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
