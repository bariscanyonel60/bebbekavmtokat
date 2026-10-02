import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader, EmptyRow, tableClass, tdClass, thClass } from "@/components/admin/page-header";
import { buttonClass } from "@/components/ui/button-styles";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Markalar" };

export default async function AdminBrandsPage() {
  await requireAdmin();
  const brands = await db.brand.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], include: { _count: { select: { products: true } } } });

  return (
    <>
      <AdminPageHeader
        title="Markalar"
        description="“Öne çıkan” markalar ana sayfadaki marka şeridinde görünür."
        actions={
          <Link href="/admin/markalar/yeni" className={buttonClass("primary", "md")}>
            <Plus className="size-4" aria-hidden="true" /> Yeni Marka
          </Link>
        }
      />
      <div className="overflow-x-auto rounded-3xl border border-line bg-white">
        <table className={tableClass}>
          <thead className="border-b border-line bg-cream/40">
            <tr>
              <th className={thClass}>Marka</th>
              <th className={thClass}>Ürün</th>
              <th className={thClass}>Sıra</th>
              <th className={thClass}>Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {brands.length === 0 ? <EmptyRow colSpan={4}>Henüz marka eklenmedi.</EmptyRow> : null}
            {brands.map((brand) => (
              <tr key={brand.id} className="hover:bg-cream/30">
                <td className={tdClass}>
                  <Link href={`/admin/markalar/${brand.id}`} className="flex items-center gap-3 font-medium text-ink hover:underline">
                    <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-cream text-xs text-ink-muted">
                      {brand.logoUrl ? <Image src={brand.logoUrl} alt="" fill sizes="40px" className="object-contain p-1" unoptimized /> : brand.name.slice(0, 2)}
                    </span>
                    {brand.name}
                  </Link>
                </td>
                <td className={tdClass}>{brand._count.products}</td>
                <td className={tdClass}>{brand.sortOrder}</td>
                <td className={tdClass}>
                  <span className="flex flex-wrap gap-1.5 text-xs">
                    <span className={`rounded-full px-2.5 py-1 ${brand.isActive ? "bg-sage-soft text-sage-deep" : "bg-sand text-ink-soft"}`}>{brand.isActive ? "Aktif" : "Pasif"}</span>
                    {brand.isFeatured ? <span className="rounded-full bg-peach-soft px-2.5 py-1 text-rose-deep">Öne çıkan</span> : null}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
