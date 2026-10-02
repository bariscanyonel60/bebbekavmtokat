import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteBanner, saveBanner } from "@/app/admin/(panel)/bannerlar/actions";
import { BannerForm } from "@/components/admin/creative-forms";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Banner" };

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ kaydedildi?: string }> };

export default async function BannerEditPage({ params, searchParams }: PageProps) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const banner = id === "yeni" ? null : await db.banner.findUnique({ where: { id } });
  if (id !== "yeni" && !banner) notFound();

  return (
    <>
      <AdminPageHeader
        title={banner ? banner.title : "Yeni Banner"}
        backHref="/admin/bannerlar"
        actions={banner ? <DeleteButton action={deleteBanner.bind(null, banner.id)} confirmText="Bu banner silinsin mi?" /> : null}
      />
      {query.kaydedildi ? <p className="mb-6 rounded-2xl bg-sage-soft px-5 py-4 text-sm text-sage-deep">Banner kaydedildi.</p> : null}
      <BannerForm
        action={saveBanner.bind(null, banner?.id ?? null)}
        values={{
          placement: banner?.placement ?? "HOME_PRIMARY",
          eyebrow: banner?.eyebrow ?? "",
          title: banner?.title ?? "",
          description: banner?.description ?? "",
          ctaLabel: banner?.ctaLabel ?? "",
          href: banner?.href ?? "",
          imageUrl: banner?.imageUrl ?? "",
          mobileImageUrl: banner?.mobileImageUrl ?? "",
          imageAlt: banner?.imageAlt ?? "",
          textTheme: banner?.textTheme ?? "DARK",
          sortOrder: banner?.sortOrder ?? 0,
          isActive: banner?.isActive ?? true,
        }}
      />
    </>
  );
}
