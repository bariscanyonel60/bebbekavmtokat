import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ImageOff, Plus, Search } from "lucide-react";
import { AdminPageHeader, EmptyRow, tableClass, tdClass, thClass } from "@/components/admin/page-header";
import { STOCK_LABELS } from "@/components/product/stock-label";
import { buttonClass } from "@/components/ui/button-styles";
import { getAdminCategoryOptions } from "@/lib/admin/options";
import { requireAdmin } from "@/lib/auth/session";
import { buildSearchWhere, toNumber } from "@/lib/catalog/products";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Ürünler" };

const PAGE_SIZE = 30;

type SearchParams = Promise<{ q?: string; kategori?: string; durum?: string; sayfa?: string }>;

export default async function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(params.sayfa ?? "1", 10) || 1);

  const and: Prisma.ProductWhereInput[] = [];
  if (q) and.push({ OR: [{ AND: buildSearchWhere(q) }, { sku: { contains: q } }] });
  if (params.kategori) and.push({ categories: { some: { categoryId: params.kategori } } });
  if (params.durum === "yayinda") and.push({ isActive: true });
  if (params.durum === "taslak") and.push({ isActive: false });
  if (params.durum === "gorselsiz") and.push({ images: { none: {} } });
  const where: Prisma.ProductWhereInput = { AND: and };

  const [categories, total, products] = await Promise.all([
    getAdminCategoryOptions(),
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        salePrice: true,
        showPrice: true,
        stockStatus: true,
        isActive: true,
        brand: { select: { name: true } },
        primaryCategory: { select: { name: true } },
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1, select: { url: true } },
      },
    }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (target: number) => {
    const query = new URLSearchParams({ ...(q ? { q } : {}), ...(params.kategori ? { kategori: params.kategori } : {}), ...(params.durum ? { durum: params.durum } : {}), sayfa: String(target) });
    return `/admin/urunler?${query}`;
  };

  return (
    <>
      <AdminPageHeader
        title="Ürünler"
        description={`${total} ürün`}
        actions={
          <Link href="/admin/urunler/yeni" className={buttonClass("primary", "md")}>
            <Plus className="size-4" aria-hidden="true" /> Yeni Ürün
          </Link>
        }
      />

      <form className="mb-5 grid gap-3 rounded-3xl border border-line bg-white p-4 md:grid-cols-[1fr_16rem_12rem_auto]" role="search">
        <label className="relative">
          <span className="sr-only">Ürün ara</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input name="q" defaultValue={q} placeholder="Ürün adı, marka veya kod" className="h-11 w-full rounded-xl border border-line-strong pl-10 pr-4 text-sm focus:border-ink focus:outline-none" />
        </label>
        <label>
          <span className="sr-only">Kategori</span>
          <select name="kategori" defaultValue={params.kategori ?? ""} className="h-11 w-full rounded-xl border border-line-strong px-3 text-sm focus:border-ink focus:outline-none">
            <option value="">Tüm kategoriler</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.path}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Durum</span>
          <select name="durum" defaultValue={params.durum ?? ""} className="h-11 w-full rounded-xl border border-line-strong px-3 text-sm focus:border-ink focus:outline-none">
            <option value="">Tüm durumlar</option>
            <option value="yayinda">Yayında</option>
            <option value="taslak">Taslak</option>
            <option value="gorselsiz">Görseli olmayan</option>
          </select>
        </label>
        <button type="submit" className={buttonClass("secondary", "md")}>
          Filtrele
        </button>
      </form>

      <div className="overflow-x-auto rounded-3xl border border-line bg-white">
        <table className={tableClass}>
          <thead className="border-b border-line bg-cream/40">
            <tr>
              <th className={thClass}>Ürün</th>
              <th className={thClass}>Kategori</th>
              <th className={thClass}>Fiyat</th>
              <th className={thClass}>Stok</th>
              <th className={thClass}>Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.length === 0 ? <EmptyRow colSpan={5}>Kriterlere uygun ürün bulunamadı.</EmptyRow> : null}
            {products.map((product) => {
              const price = toNumber(product.salePrice) ?? toNumber(product.price);
              return (
                <tr key={product.id} className="hover:bg-cream/30">
                  <td className={tdClass}>
                    <Link href={`/admin/urunler/${product.id}`} className="flex items-center gap-3">
                      <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-cream text-ink-muted">
                        {product.images[0] ? <Image src={product.images[0].url} alt="" fill sizes="48px" unoptimized className="object-cover" /> : <ImageOff className="size-4" aria-hidden="true" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink hover:underline">{product.name}</span>
                        <span className="text-xs text-ink-muted">
                          {product.sku}
                          {product.brand ? ` · ${product.brand.name}` : ""}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className={`${tdClass} text-ink-soft`}>{product.primaryCategory?.name ?? "—"}</td>
                  <td className={tdClass}>{product.showPrice && price !== null ? formatPrice(price) : <span className="text-ink-muted">Gizli</span>}</td>
                  <td className={`${tdClass} text-ink-soft`}>{STOCK_LABELS[product.stockStatus].label}</td>
                  <td className={tdClass}>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.isActive ? "bg-sage-soft text-sage-deep" : "bg-sand text-ink-soft"}`}>{product.isActive ? "Yayında" : "Taslak"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pageCount > 1 ? (
        <nav aria-label="Sayfalama" className="mt-6 flex items-center justify-center gap-2 text-sm">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className={buttonClass("secondary", "sm")}>
              Önceki
            </Link>
          ) : null}
          <span className="px-3 text-ink-muted">
            {page} / {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={pageHref(page + 1)} className={buttonClass("secondary", "sm")}>
              Sonraki
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}
