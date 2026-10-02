"use client";

import { AdminForm, Panel } from "@/components/admin/admin-form";
import { TextArea, TextField, Toggle } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/image-field";
import type { ActionState } from "@/lib/admin/form";

type BrandFormValues = {
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

export function BrandForm({ action, values }: { action: (prev: ActionState, form: FormData) => Promise<ActionState>; values: BrandFormValues }) {
  return (
    <AdminForm
      action={action}
      aside={
        <Panel title="Görünürlük">
          <Toggle name="isActive" label="Aktif" defaultChecked={values.isActive} />
          <Toggle name="isFeatured" label="Ana sayfada öne çıkar" defaultChecked={values.isFeatured} />
          <TextField name="sortOrder" label="Sıra" type="number" defaultValue={values.sortOrder} />
        </Panel>
      }
    >
      <Panel title="Marka bilgileri">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="name" label="Marka adı" required defaultValue={values.name} />
          <TextField name="slug" label="URL (slug)" defaultValue={values.slug} hint="Boşsa addan üretilir." />
        </div>
        <ImageField name="logoUrl" label="Logo" defaultValue={values.logoUrl} aspect="aspect-[3/1]" hint="Şeffaf PNG veya WebP önerilir. Boşsa marka adı yazı olarak gösterilir." />
        <TextArea name="description" label="Açıklama" defaultValue={values.description} rows={4} />
      </Panel>
      <Panel title="SEO">
        <TextField name="seoTitle" label="SEO başlığı" defaultValue={values.seoTitle} />
        <TextArea name="seoDescription" label="SEO açıklaması" defaultValue={values.seoDescription} rows={2} />
      </Panel>
    </AdminForm>
  );
}
