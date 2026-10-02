"use client";

import type { BannerPlacement, TextTheme } from "@prisma/client";
import { AdminForm, Panel } from "@/components/admin/admin-form";
import { SelectField, TextArea, TextField, Toggle } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/image-field";
import type { ActionState } from "@/lib/admin/form";
import { PLACEMENT_LABELS, TEXT_THEME_LABELS, toOptions } from "@/lib/admin/labels";

type FormAction = (prev: ActionState, form: FormData) => Promise<ActionState>;

export type HeroSlideValues = {
  eyebrow: string;
  title: string;
  description: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  imageAlt: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  showWhatsappCta: boolean;
  textTheme: TextTheme;
  sortOrder: number;
  isActive: boolean;
};

export function HeroSlideForm({ action, values }: { action: FormAction; values: HeroSlideValues }) {
  return (
    <AdminForm
      action={action}
      aside={
        <Panel title="Yayın">
          <Toggle name="isActive" label="Aktif" defaultChecked={values.isActive} />
          <TextField name="sortOrder" label="Sıra" type="number" defaultValue={values.sortOrder} />
          <SelectField name="textTheme" label="Yazı rengi" defaultValue={values.textTheme} options={toOptions(TEXT_THEME_LABELS)} />
        </Panel>
      }
    >
      <Panel title="İçerik">
        <TextField name="eyebrow" label="Üst başlık" defaultValue={values.eyebrow} placeholder="Örn. Yeni Sezon" />
        <TextField name="title" label="Başlık" required defaultValue={values.title} />
        <TextArea name="description" label="Açıklama" defaultValue={values.description} rows={3} />
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="primaryCtaLabel" label="Buton metni" defaultValue={values.primaryCtaLabel} placeholder="Koleksiyonu Keşfet" />
          <TextField name="primaryCtaHref" label="Buton linki" defaultValue={values.primaryCtaHref} placeholder="/kategori/bebek-arabalari" />
        </div>
        <Toggle name="showWhatsappCta" label="“WhatsApp'tan Bilgi Al” butonunu göster" defaultChecked={values.showWhatsappCta} />
      </Panel>
      <Panel title="Görseller">
        <ImageField name="desktopImageUrl" label="Masaüstü görseli" required defaultValue={values.desktopImageUrl} aspect="aspect-[21/9]" hint="En az 2400×1000 px önerilir." />
        <ImageField name="mobileImageUrl" label="Mobil görseli" defaultValue={values.mobileImageUrl} aspect="aspect-[4/5]" hint="Boşsa masaüstü görseli kırpılarak kullanılır." />
        <TextField name="imageAlt" label="Görsel açıklaması (alt)" defaultValue={values.imageAlt} />
      </Panel>
    </AdminForm>
  );
}

export type BannerValues = {
  placement: BannerPlacement;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  imageUrl: string;
  mobileImageUrl: string;
  imageAlt: string;
  textTheme: TextTheme;
  sortOrder: number;
  isActive: boolean;
};

export function BannerForm({ action, values }: { action: FormAction; values: BannerValues }) {
  return (
    <AdminForm
      action={action}
      aside={
        <Panel title="Yayın">
          <Toggle name="isActive" label="Aktif" defaultChecked={values.isActive} />
          <SelectField name="placement" label="Konum" defaultValue={values.placement} options={toOptions(PLACEMENT_LABELS)} />
          <TextField name="sortOrder" label="Sıra" type="number" defaultValue={values.sortOrder} />
          <SelectField name="textTheme" label="Yazı rengi" defaultValue={values.textTheme} options={toOptions(TEXT_THEME_LABELS)} />
        </Panel>
      }
    >
      <Panel title="İçerik">
        <TextField name="eyebrow" label="Üst başlık" defaultValue={values.eyebrow} />
        <TextField name="title" label="Başlık" required defaultValue={values.title} />
        <TextArea name="description" label="Açıklama" defaultValue={values.description} rows={3} />
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="ctaLabel" label="Buton metni" defaultValue={values.ctaLabel} />
          <TextField name="href" label="Link" defaultValue={values.href} placeholder="/kampanyalar" />
        </div>
      </Panel>
      <Panel title="Görseller">
        <ImageField name="imageUrl" label="Görsel" required defaultValue={values.imageUrl} />
        <ImageField name="mobileImageUrl" label="Mobil görsel" defaultValue={values.mobileImageUrl} aspect="aspect-[4/5]" hint="Boşsa ana görsel kullanılır." />
        <TextField name="imageAlt" label="Görsel açıklaması (alt)" defaultValue={values.imageAlt} />
      </Panel>
    </AdminForm>
  );
}
