import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Copy, ExternalLink } from "lucide-react";
import { deleteProduct, duplicateProduct, saveProduct } from "@/app/admin/(panel)/urunler/actions";
import { toProductFormValues } from "@/app/admin/(panel)/urunler/product-values";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { buttonClass } from "@/components/ui/button-styles";
import { getAdminCategoryOptions, getAttributeGroups, getBrandOptions } from "@/lib/admin/options";
import { requireAdmin } from "@/lib/auth/session";
import { productDetailInclude } from "@/lib/catalog/products";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Ürünü Düzenle" };

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ kaydedildi?: string }> };

export default async function EditProductPage({ params, searchParams }: PageProps) {
  await requireAdmin();
  const [{ id }, { kaydedildi }] = await Promise.all([params, searchParams]);
  const [product, brands, categories, attributes] = await Promise.all([
    db.product.findUnique({ where: { id }, include: productDetailInclude }),
    getBrandOptions(),
    getAdminCategoryOptions(),
    getAttributeGroups(),
  ]);
  if (!product) notFound();

  return (
    <>
      <AdminPageHeader
        title={product.name}
        description={`Ürün kodu: ${product.sku}`}
        backHref="/admin/urunler"
        actions={
          <>
            {product.isActive ? (
              <Link href={`/urun/${product.slug}`} target="_blank" className={buttonClass("secondary", "sm")}>
                <ExternalLink className="size-4" aria-hidden="true" /> Sitede gör
              </Link>
            ) : null}
            <form action={duplicateProduct.bind(null, product.id)}>
              <button type="submit" className={buttonClass("secondary", "sm")}>
                <Copy className="size-4" aria-hidden="true" /> Kopyala
              </button>
            </form>
            <DeleteButton action={deleteProduct.bind(null, product.id)} confirmText={`“${product.name}” kalıcı olarak silinsin mi? Bu işlem geri alınamaz.`} />
          </>
        }
      />
      {kaydedildi ? <p className="mb-6 rounded-2xl bg-sage-soft px-5 py-4 text-sm text-sage-deep">Ürün kaydedildi.</p> : null}
      <ProductForm action={saveProduct.bind(null, product.id)} values={toProductFormValues(product)} brands={brands} categories={categories} attributes={attributes} />
    </>
  );
}
