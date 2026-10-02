import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { saveSeoPages, saveSettings } from "@/app/admin/(panel)/ayarlar/actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { SeoPagesForm, SettingsForm, type SeoPageValues } from "@/components/admin/settings-form";
import { hoursToText, SETTING_GROUPS, trustToText, type SettingGroup } from "@/lib/admin/settings-groups";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

type PageProps = { params: Promise<{ group: string }> };

function isGroup(value: string): value is SettingGroup {
  return value in SETTING_GROUPS;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { group } = await params;
  return { title: isGroup(group) ? SETTING_GROUPS[group].title : "Ayarlar" };
}

export default async function SettingsPage({ params }: PageProps) {
  await requireAdmin();
  const { group } = await params;
  if (!isGroup(group)) notFound();

  const settings = await getSettings();
  const values: Record<string, string> = { ...settings };
  for (const field of SETTING_GROUPS[group].sections.flatMap((section) => section.fields)) {
    if (field.kind === "hours") values[field.key] = hoursToText(settings[field.key]);
    if (field.kind === "trust") values[field.key] = trustToText(settings[field.key]);
  }

  let seoValues: SeoPageValues = {};
  if (group === "seo") {
    const rows = await db.seoSetting.findMany();
    seoValues = Object.fromEntries(rows.map((row) => [row.key, { title: row.title ?? "", description: row.description ?? "", ogImageUrl: row.ogImageUrl ?? "", noIndex: row.noIndex }]));
  }

  return (
    <>
      <AdminPageHeader title={SETTING_GROUPS[group].title} description={SETTING_GROUPS[group].description} />
      <SettingsForm group={group} action={saveSettings.bind(null, group)} values={values} />
      {group === "seo" ? (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-2xl text-ink">Sayfa bazlı SEO</h2>
          <SeoPagesForm action={saveSeoPages} values={seoValues} />
        </section>
      ) : null}
    </>
  );
}
