import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

const getPage = cache((slug: string) => db.page.findFirst({ where: { slug, isActive: true } }));

export async function legalPageMetadata(slug: string): Promise<Metadata> {
  const page = await getPage(slug);
  if (!page) return {};
  return buildMetadata({ title: page.seoTitle || `${page.title} | Bebbek AVM`, description: page.seoDescription || page.title, path: `/${slug}` });
}

/** Admin'den düzenlenen metin sayfası. "## " ile başlayan satırlar alt başlık olarak gösterilir. */
export async function LegalPage({ slug }: { slug: string }) {
  const page = await getPage(slug);
  if (!page) notFound();

  const blocks = page.content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="container-page pb-8 pt-6 md:pt-8">
      <Breadcrumbs items={[{ name: page.title, href: `/${slug}` }]} />
      <article className="mx-auto mt-10 max-w-3xl">
        <h1 className="font-display text-[2.2rem] leading-[1.08] tracking-tight text-ink md:text-[3rem]">{page.title}</h1>
        <p className="mt-3 text-sm text-ink-muted">Son güncelleme: {formatDate(page.updatedAt)}</p>
        <div className="mt-10 space-y-5 text-[0.98rem] leading-relaxed text-ink-soft">
          {blocks.map((block, index) =>
            block.startsWith("## ") ? (
              <h2 key={index} className="pt-4 font-display text-2xl text-ink">
                {block.slice(3)}
              </h2>
            ) : (
              <p key={index} className="whitespace-pre-line">
                {block}
              </p>
            ),
          )}
        </div>
      </article>
    </div>
  );
}
