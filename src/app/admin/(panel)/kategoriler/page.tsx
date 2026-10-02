import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { moveCategory } from "@/app/admin/(panel)/kategoriler/actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonClass } from "@/components/ui/button-styles";
import { getAdminCategoryOptions } from "@/lib/admin/options";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Kategoriler" };

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const [options, counts, flags] = await Promise.all([
    getAdminCategoryOptions(),
    db.productCategory.groupBy({ by: ["categoryId"], _count: { _all: true } }),
    db.category.findMany({ select: { id: true, showInMenu: true, isPopular: true, isHomeFeatured: true } }),
  ]);
  const countMap = new Map(counts.map((item) => [item.categoryId, item._count._all]));
  const flagMap = new Map(flags.map((item) => [item.id, item]));

  return (
    <>
      <AdminPageHeader
        title="Kategoriler"
        description="Sınırsız derinlikte kategori ağacı. Sıralamayı oklarla değiştirebilirsiniz."
        actions={
          <Link href="/admin/kategoriler/yeni" className={buttonClass("primary", "md")}>
            <Plus className="size-4" aria-hidden="true" /> Yeni Kategori
          </Link>
        }
      />
      <div className="overflow-hidden rounded-3xl border border-line bg-white">
        <ul className="divide-y divide-line">
          {options.map((category) => {
            const flag = flagMap.get(category.value);
            return (
              <li key={category.value} className="flex items-center gap-3 px-4 py-2.5 hover:bg-cream/30 md:px-5">
                <div className="flex shrink-0">
                  <form action={moveCategory.bind(null, category.value, "up")}>
                    <button type="submit" className="grid size-8 place-items-center rounded-lg text-ink-muted hover:bg-cream hover:text-ink" aria-label={`${category.label} yukarı taşı`}>
                      <ArrowUp className="size-3.5" aria-hidden="true" />
                    </button>
                  </form>
                  <form action={moveCategory.bind(null, category.value, "down")}>
                    <button type="submit" className="grid size-8 place-items-center rounded-lg text-ink-muted hover:bg-cream hover:text-ink" aria-label={`${category.label} aşağı taşı`}>
                      <ArrowDown className="size-3.5" aria-hidden="true" />
                    </button>
                  </form>
                </div>
                <Link href={`/admin/kategoriler/${category.value}`} className="flex min-w-0 flex-1 items-center gap-2 text-sm" style={{ paddingLeft: `${category.depth * 1.5}rem` }}>
                  {category.depth > 0 ? <span className="text-line-strong" aria-hidden="true">└</span> : null}
                  <span className={`truncate hover:underline ${category.depth === 0 ? "font-semibold text-ink" : "text-ink-soft"}`}>{category.label}</span>
                  {!category.isActive ? <span className="rounded-full bg-sand px-2 py-0.5 text-[0.65rem] text-ink-soft">Pasif</span> : null}
                  {flag?.isPopular ? <span className="rounded-full bg-powder-soft px-2 py-0.5 text-[0.65rem] text-brand-blue-deep">Popüler</span> : null}
                  {flag?.isHomeFeatured ? <span className="rounded-full bg-peach-soft px-2 py-0.5 text-[0.65rem] text-rose-deep">Ana sayfa</span> : null}
                  {flag && !flag.showInMenu ? <span className="rounded-full bg-cream px-2 py-0.5 text-[0.65rem] text-ink-muted">Menüde yok</span> : null}
                </Link>
                <span className="shrink-0 text-xs text-ink-muted">{countMap.get(category.value) ?? 0} ürün</span>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
