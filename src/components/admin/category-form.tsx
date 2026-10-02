"use client";

import { AdminForm, Panel } from "@/components/admin/admin-form";
import { CheckboxList, SelectField, TextArea, TextField, Toggle } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/image-field";
import type { ActionState } from "@/lib/admin/form";

export type CategoryFormValues = {
  name: string;
  slug: string;
  parentId: string | null;
  tagline: string;
  description: string;
  imageUrl: string;
  bannerUrl: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  isActive: boolean;
  showInMenu: boolean;
  isPopular: boolean;
  popularLabel: string;
  isHomeFeatured: boolean;
  homeSortOrder: number;
  attributeIds: string[];
};

type CategoryFormProps = {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  values: CategoryFormValues;
  parents: { value: string; label: string }[];
  attributes: { value: string; label: string }[];
};

export function CategoryForm({ action, values, parents, attributes }: CategoryFormProps) {
  return (
    <AdminForm
      action={action}
      aside={
        <>
          <Panel title="Görünürlük">
            <Toggle name="isActive" label="Aktif" defaultChecked={values.isActive} hint="Pasif kategoriler sitede görünmez." />
            <Toggle name="showInMenu" label="Menüde göster" defaultChecked={values.showInMenu} />
            <TextField name="sortOrder" label="Menü sırası" type="number" defaultValue={values.sortOrder} />
          </Panel>
          <Panel title="Ana sayfa">
            <Toggle name="isPopular" label="Popüler kategorilerde göster" defaultChecked={values.isPopular} hint="Ana sayfadaki yuvarlak kategori şeridi." />
            <TextField name="popularLabel" label="Kısa etiket" defaultValue={values.popularLabel} hint="Örn. “Oto Koltuğu”. Boşsa kategori adı kullanılır." />
            <Toggle name="isHomeFeatured" label="“İhtiyacınız Olan Her Şey” alanında göster" defaultChecked={values.isHomeFeatured} />
            <TextField name="homeSortOrder" label="Ana sayfa sırası" type="number" defaultValue={values.homeSortOrder} />
          </Panel>
          <Panel title="Filtreler" description="Bu kategoride ve alt kategorilerinde gösterilecek filtreler.">
            <CheckboxList name="attributeIds" label="Filtrelenebilir özellikler" options={attributes} defaultValues={values.attributeIds} />
          </Panel>
        </>
      }
    >
      <Panel title="Kategori bilgileri">
        <TextField name="name" label="Kategori adı" required defaultValue={values.name} />
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="slug" label="URL (slug)" defaultValue={values.slug} hint="Boşsa addan üretilir." />
          <SelectField name="parentId" label="Üst kategori" defaultValue={values.parentId} options={parents} emptyLabel="— Ana kategori —" />
        </div>
        <TextField name="tagline" label="Kısa slogan" defaultValue={values.tagline} hint="Mega menü ve ana sayfa kartlarında görünür." />
        <TextArea name="description" label="SEO açıklama metni" defaultValue={values.description} rows={4} hint="Kategori başlığının altında gösterilir." />
      </Panel>
      <Panel title="Görseller">
        <ImageField name="imageUrl" label="Kategori görseli" defaultValue={values.imageUrl} aspect="aspect-square" hint="Kare veya 4:3 önerilir." />
        <ImageField name="bannerUrl" label="Kategori banner görseli" defaultValue={values.bannerUrl} hint="Boşsa kategori görseli kullanılır." />
      </Panel>
      <Panel title="SEO">
        <TextField name="seoTitle" label="SEO başlığı" defaultValue={values.seoTitle} />
        <TextArea name="seoDescription" label="SEO açıklaması" defaultValue={values.seoDescription} rows={2} />
      </Panel>
    </AdminForm>
  );
}
