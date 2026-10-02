"use client";

import { AdminForm, Panel } from "@/components/admin/admin-form";
import { SelectField, TextArea, TextField, Toggle } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/image-field";
import type { ActionState } from "@/lib/admin/form";
import { SEO_PAGE_KEYS, SETTING_GROUPS, type SettingField, type SettingGroup } from "@/lib/admin/settings-groups";

type FormAction = (prev: ActionState, form: FormData) => Promise<ActionState>;

function SettingInput({ field, value }: { field: SettingField; value: string }) {
  const common = { name: field.key, label: field.label, hint: field.hint };
  switch (field.kind) {
    case "text":
      return <TextField {...common} defaultValue={value} placeholder={field.placeholder} />;
    case "url":
    case "href":
      return <TextField {...common} defaultValue={value} placeholder={field.placeholder} type="text" />;
    case "email":
      return <TextField {...common} defaultValue={value} type="email" />;
    case "phone":
      return <TextField {...common} defaultValue={value} type="tel" placeholder={field.placeholder} />;
    case "textarea":
    case "hours":
    case "trust":
      return <TextArea {...common} defaultValue={value} rows={field.rows} />;
    case "toggle":
      return <Toggle {...common} defaultChecked={value === "true"} />;
    case "image":
      return <ImageField {...common} defaultValue={value} aspect="aspect-[1200/630]" />;
    case "select":
      return <SelectField {...common} defaultValue={value} options={field.options ?? []} />;
    default: {
      const exhaustive: never = field.kind;
      return exhaustive;
    }
  }
}

export function SettingsForm({ group, action, values }: { group: SettingGroup; action: FormAction; values: Record<string, string> }) {
  return (
    <AdminForm action={action} submitPlacement={group === "seo" ? "inline" : "fixed"} submitLabel={group === "seo" ? "Varsayılanları Kaydet" : undefined}>
      {SETTING_GROUPS[group].sections.map((section) => (
        <Panel key={section.title} title={section.title} description={section.description}>
          {section.fields.map((field) => (
            <SettingInput key={field.key} field={field} value={values[field.key] ?? ""} />
          ))}
        </Panel>
      ))}
    </AdminForm>
  );
}

export type SeoPageValues = Record<string, { title: string; description: string; ogImageUrl: string; noIndex: boolean }>;

export function SeoPagesForm({ action, values }: { action: FormAction; values: SeoPageValues }) {
  return (
    <AdminForm action={action} submitLabel="Sayfa SEO'sunu Kaydet" submitPlacement="inline">
      {SEO_PAGE_KEYS.map((page) => {
        const value = values[page.key];
        return (
          <Panel key={page.key} title={page.label} description={page.path}>
            <TextField name={`${page.key}.title`} label="Başlık" defaultValue={value?.title} hint="Boşsa varsayılan başlık kullanılır." />
            <TextArea name={`${page.key}.description`} label="Açıklama" defaultValue={value?.description} rows={2} />
            <ImageField name={`${page.key}.ogImageUrl`} label="Paylaşım görseli" defaultValue={value?.ogImageUrl} aspect="aspect-[1200/630]" />
            <Toggle name={`${page.key}.noIndex`} label="Arama motorlarından gizle (noindex)" defaultChecked={value?.noIndex} />
          </Panel>
        );
      })}
    </AdminForm>
  );
}
