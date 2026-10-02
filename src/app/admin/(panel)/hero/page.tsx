import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CreativeList } from "@/components/admin/creative-list";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonClass } from "@/components/ui/button-styles";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Hero Slider" };

export default async function AdminHeroPage() {
  await requireAdmin();
  const slides = await db.heroSlide.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return (
    <>
      <AdminPageHeader
        title="Hero Slider"
        description="Ana sayfanın en üstündeki büyük slaytlar. Sıra numarası küçük olan önce gösterilir."
        actions={
          <Link href="/admin/hero/yeni" className={buttonClass("primary", "md")}>
            <Plus className="size-4" aria-hidden="true" /> Yeni Slayt
          </Link>
        }
      />
      <CreativeList
        basePath="/admin/hero"
        emptyText="Henüz slayt yok."
        rows={slides.map((slide) => ({ id: slide.id, title: slide.title, imageUrl: slide.desktopImageUrl, meta: `Sıra ${slide.sortOrder}`, isActive: slide.isActive }))}
      />
    </>
  );
}
