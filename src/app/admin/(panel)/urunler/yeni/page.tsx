import type { Metadata } from "next";
import { saveProduct } from "@/app/admin/(panel)/urunler/actions";
import { EMPTY_PRODUCT } from "@/app/admin/(panel)/urunler/product-values";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategoryOptions, getAttributeGroups, getBrandOptions } from "@/lib/admin/options";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Yeni Ürün" };

export default async function NewProductPage() {
  await requireAdmin();
  const [brands, categories, attributes] = await Promise.all([getBrandOptions(), getAdminCategoryOptions(), getAttributeGroups()]);
  return (
    <>
      <AdminPageHeader title="Yeni Ürün" backHref="/admin/urunler" />
      <ProductForm action={saveProduct.bind(null, null)} values={EMPTY_PRODUCT} brands={brands} categories={categories} attributes={attributes} />
    </>
  );
}
