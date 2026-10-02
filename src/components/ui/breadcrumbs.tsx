import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { breadcrumbJsonLd, serializeJsonLd, type BreadcrumbItem } from "@/lib/seo";
import { getSiteUrl } from "@/lib/settings";

export async function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const siteUrl = await getSiteUrl();
  const all = [{ name: "Ana Sayfa", href: "/" }, ...items];
  return (
    <nav aria-label="Sayfa konumu" className="text-sm text-ink-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((item, index) => {
          const isLast = index === all.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="text-ink">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.href} className="transition-colors hover:text-ink">
                    {item.name}
                  </Link>
                  <ChevronRight className="size-3.5 text-line-strong" aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd(siteUrl, all)) }} />
    </nav>
  );
}
