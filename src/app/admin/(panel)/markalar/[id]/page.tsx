import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { deleteBrand, saveBrand } from "@/app/admin/(panel)/markalar/actions";
import { BrandForm } from "@/components/admin/brand-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonClass } from "@/components/ui/button-styles";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Marka" };

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ kaydedildi?: string }> };

export default async function BrandEditPage({ params, searchParams }: PageProps) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const brand = id === "yeni" ? null : await db.brand.findUnique({ where: { id } });
  if (id !== "yeni" && !brand) notFound();

  return (
    <>
      <AdminPageHeader
        title={brand ? brand.name : "Yeni Marka"}
        backHref="/admin/markalar"
        actions={
          brand ? (
            <>
              {brand.isActive ? (
                <Link href={`/marka/${brand.slug}`} target="_blank" className={buttonClass("secondary", "sm")}>
                  <ExternalLink className="size-4" aria-hidden="true" /> Sitede gör
                </Link>
              ) : null}
              <DeleteButton action={deleteBrand.bind(null, brand.id)} confirmText={`“${brand.name}” silinsin mi? Ürünler silinmez, markasız kalır.`} />
            </>
          ) : null
        }
      />
      {query.kaydedildi ? <p className="mb-6 rounded-2xl bg-sage-soft px-5 py-4 text-sm text-sage-deep">Marka kaydedildi.</p> : null}
      <BrandForm
        action={saveBrand.bind(null, brand?.id ?? null)}
        values={{
          name: brand?.name ?? "",
          slug: brand?.slug ?? "",
          logoUrl: brand?.logoUrl ?? "",
          description: brand?.description ?? "",
          seoTitle: brand?.seoTitle ?? "",
          seoDescription: brand?.seoDescription ?? "",
          isActive: brand?.isActive ?? true,
          isFeatured: brand?.isFeatured ?? true,
          sortOrder: brand?.sortOrder ?? 0,
        }}
      />
    </>
  );
}
