import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CreativeList } from "@/components/admin/creative-list";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonClass } from "@/components/ui/button-styles";
import { PLACEMENT_LABELS } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Bannerlar" };

export default async function AdminBannersPage() {
  await requireAdmin();
  const banners = await db.banner.findMany({ orderBy: [{ placement: "asc" }, { sortOrder: "asc" }] });
  return (
    <>
      <AdminPageHeader
        title="Bannerlar"
        description="Ana sayfa kampanya alanları ve mega menü görselleri."
        actions={
          <Link href="/admin/bannerlar/yeni" className={buttonClass("primary", "md")}>
            <Plus className="size-4" aria-hidden="true" /> Yeni Banner
          </Link>
        }
      />
      <CreativeList
        basePath="/admin/bannerlar"
        emptyText="Henüz banner yok."
        rows={banners.map((banner) => ({ id: banner.id, title: banner.title, imageUrl: banner.imageUrl, meta: `${PLACEMENT_LABELS[banner.placement]} · Sıra ${banner.sortOrder}`, isActive: banner.isActive }))}
      />
    </>
  );
}
