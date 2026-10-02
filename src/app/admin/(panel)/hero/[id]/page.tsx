import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteHeroSlide, saveHeroSlide } from "@/app/admin/(panel)/hero/actions";
import { HeroSlideForm } from "@/components/admin/creative-forms";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Hero Slayt" };

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ kaydedildi?: string }> };

export default async function HeroSlideEditPage({ params, searchParams }: PageProps) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const slide = id === "yeni" ? null : await db.heroSlide.findUnique({ where: { id } });
  if (id !== "yeni" && !slide) notFound();

  return (
    <>
      <AdminPageHeader
        title={slide ? slide.title : "Yeni Slayt"}
        backHref="/admin/hero"
        actions={slide ? <DeleteButton action={deleteHeroSlide.bind(null, slide.id)} confirmText="Bu slayt silinsin mi?" /> : null}
      />
      {query.kaydedildi ? <p className="mb-6 rounded-2xl bg-sage-soft px-5 py-4 text-sm text-sage-deep">Slayt kaydedildi.</p> : null}
      <HeroSlideForm
        action={saveHeroSlide.bind(null, slide?.id ?? null)}
        values={{
          eyebrow: slide?.eyebrow ?? "",
          title: slide?.title ?? "",
          description: slide?.description ?? "",
          desktopImageUrl: slide?.desktopImageUrl ?? "",
          mobileImageUrl: slide?.mobileImageUrl ?? "",
          imageAlt: slide?.imageAlt ?? "",
          primaryCtaLabel: slide?.primaryCtaLabel ?? "",
          primaryCtaHref: slide?.primaryCtaHref ?? "",
          showWhatsappCta: slide?.showWhatsappCta ?? true,
          textTheme: slide?.textTheme ?? "DARK",
          sortOrder: slide?.sortOrder ?? 0,
          isActive: slide?.isActive ?? true,
        }}
      />
    </>
  );
}
