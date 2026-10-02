import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { deleteCategory, saveCategory } from "@/app/admin/(panel)/kategoriler/actions";
import { CategoryForm, type CategoryFormValues } from "@/components/admin/category-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonClass } from "@/components/ui/button-styles";
import { getAdminCategoryOptions } from "@/lib/admin/options";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Kategori" };

const EMPTY: CategoryFormValues = {
  name: "",
  slug: "",
  parentId: null,
  tagline: "",
  description: "",
  imageUrl: "",
  bannerUrl: "",
  seoTitle: "",
  seoDescription: "",
  sortOrder: 0,
  isActive: true,
  showInMenu: true,
  isPopular: false,
  popularLabel: "",
  isHomeFeatured: false,
  homeSortOrder: 0,
  attributeIds: [],
};

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ kaydedildi?: string; hata?: string; ust?: string }> };

export default async function CategoryEditPage({ params, searchParams }: PageProps) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const isNew = id === "yeni";
  const [category, options, attributes] = await Promise.all([
    isNew ? null : db.category.findUnique({ where: { id }, include: { attributes: { orderBy: { sortOrder: "asc" } } } }),
    getAdminCategoryOptions(),
    db.attribute.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!isNew && !category) notFound();

  const values: CategoryFormValues = category
    ? {
        name: category.name,
        slug: category.slug,
        parentId: category.parentId,
        tagline: category.tagline ?? "",
        description: category.description ?? "",
        imageUrl: category.imageUrl ?? "",
        bannerUrl: category.bannerUrl ?? "",
        seoTitle: category.seoTitle ?? "",
        seoDescription: category.seoDescription ?? "",
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        showInMenu: category.showInMenu,
        isPopular: category.isPopular,
        popularLabel: category.popularLabel ?? "",
        isHomeFeatured: category.isHomeFeatured,
        homeSortOrder: category.homeSortOrder,
        attributeIds: category.attributes.map((item) => item.attributeId),
      }
    : { ...EMPTY, parentId: query.ust ?? null };

  const selfIndex = options.findIndex((option) => option.value === id);
  const subtreeEnd = selfIndex < 0 ? -1 : options.findIndex((option, index) => index > selfIndex && option.depth <= options[selfIndex].depth);
  const parents = options
    .filter((_, index) => selfIndex < 0 || index < selfIndex || (subtreeEnd >= 0 && index >= subtreeEnd))
    .map((option) => ({ value: option.value, label: option.path }));

  return (
    <>
      <AdminPageHeader
        title={category ? category.name : "Yeni Kategori"}
        backHref="/admin/kategoriler"
        actions={
          category ? (
            <>
              <Link href={`/admin/kategoriler/yeni?ust=${category.id}`} className={buttonClass("secondary", "sm")}>
                Alt kategori ekle
              </Link>
              {category.isActive ? (
                <Link href={`/kategori/${category.slug}`} target="_blank" className={buttonClass("secondary", "sm")}>
                  <ExternalLink className="size-4" aria-hidden="true" /> Sitede gör
                </Link>
              ) : null}
              <DeleteButton action={deleteCategory.bind(null, category.id)} confirmText={`“${category.name}” silinsin mi? Ürünler silinmez, yalnızca bu kategoriden çıkarılır.`} />
            </>
          ) : null
        }
      />
      {query.kaydedildi ? <p className="mb-6 rounded-2xl bg-sage-soft px-5 py-4 text-sm text-sage-deep">Kategori kaydedildi.</p> : null}
      {query.hata === "alt-kategori" ? <p className="mb-6 rounded-2xl bg-peach-soft px-5 py-4 text-sm text-rose-deep">Alt kategorisi olan bir kategori silinemez. Önce alt kategorileri taşıyın veya silin.</p> : null}
      <CategoryForm
        action={saveCategory.bind(null, category?.id ?? null)}
        values={values}
        parents={parents}
        attributes={attributes.map((attribute) => ({ value: attribute.id, label: attribute.name }))}
      />
    </>
  );
}
