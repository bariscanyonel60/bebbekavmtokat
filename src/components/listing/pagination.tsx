import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { filterHref, type FilterState } from "@/lib/catalog/filters";
import { cx } from "@/lib/cx";

function pageWindow(current: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((page) => page >= 1 && page <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push("gap");
    result.push(page);
  });
  return result;
}

export function Pagination({ basePath, state, pageCount }: { basePath: string; state: FilterState; pageCount: number }) {
  if (pageCount <= 1) return null;
  const href = (page: number) => filterHref(basePath, state, { type: "page", value: page });
  const linkClass = "grid size-11 place-items-center rounded-full text-sm transition-colors";

  return (
    <nav aria-label="Sayfalama" className="mt-14 flex items-center justify-center gap-1.5">
      {state.page > 1 ? (
        <Link href={href(state.page - 1)} className={cx(linkClass, "hover:bg-cream")} aria-label="Önceki sayfa">
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
      {pageWindow(state.page, pageCount).map((page, index) =>
        page === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-ink-muted" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={href(page)}
            aria-current={page === state.page ? "page" : undefined}
            className={cx(linkClass, page === state.page ? "bg-ink font-medium text-ivory" : "text-ink-soft hover:bg-cream hover:text-ink")}
          >
            {page}
          </Link>
        ),
      )}
      {state.page < pageCount ? (
        <Link href={href(state.page + 1)} className={cx(linkClass, "hover:bg-cream")} aria-label="Sonraki sayfa">
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </nav>
  );
}
