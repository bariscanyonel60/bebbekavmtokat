import type { Metadata } from "next";
import { saveHomeSections } from "@/app/admin/(panel)/ana-sayfa/actions";
import { HomeSectionsForm, type HomeSectionRow } from "@/components/admin/home-sections-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { HOME_SECTION_LABELS } from "@/lib/home-sections";

export const metadata: Metadata = { title: "Ana Sayfa" };

export default async function AdminHomePage() {
  await requireAdmin();
  const saved = await db.homeSection.findMany({ orderBy: { sortOrder: "asc" } });
  const savedKeys = new Set(saved.map((section) => section.key));

  const rows: HomeSectionRow[] = [
    ...saved
      .filter((section) => section.key in HOME_SECTION_LABELS)
      .map((section) => ({ key: section.key, label: HOME_SECTION_LABELS[section.key], title: section.title ?? "", subtitle: section.subtitle ?? "", isActive: section.isActive })),
    ...Object.entries(HOME_SECTION_LABELS)
      .filter(([key]) => !savedKeys.has(key))
      .map(([key, label]) => ({ key, label, title: "", subtitle: "", isActive: false })),
  ];

  return (
    <>
      <AdminPageHeader title="Ana Sayfa" description="Bölümlerin sırasını, görünürlüğünü ve başlıklarını yönetin. Ürün seçimleri ürün formundaki rozetlerden (Öne çıkan, Çok satan, Yeni) gelir." />
      <HomeSectionsForm action={saveHomeSections} sections={rows} />
    </>
  );
}
