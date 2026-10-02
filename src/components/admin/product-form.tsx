"use client";

import { AdminForm, Panel } from "@/components/admin/admin-form";
import { CheckboxList, SelectField, TextArea, TextField, Toggle } from "@/components/admin/fields";
import { ProductImagesField, type ProductImageInput } from "@/components/admin/product-images-field";
import type { ActionState } from "@/lib/admin/form";

export type ProductFormValues = {
  name: string;
  slug: string;
  sku: string;
  kind: "STANDARD" | "FURNITURE_SET";
  brandId: string | null;
  primaryCategoryId: string | null;
  categoryIds: string[];
  price: string;
  salePrice: string;
  showPrice: boolean;
  stockStatus: string;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isCampaign: boolean;
  isActive: boolean;
  sortOrder: number;
  shortDescription: string;
  description: string;
  ageRange: string;
  material: string;
  tags: string;
  deliveryInfo: string;
  warrantyInfo: string;
  seoTitle: string;
  seoDescription: string;
  specs: string;
  dimensions: string;
  setItems: string;
  variants: string;
  attributeValueIds: string[];
  images: ProductImageInput[];
};

type Option = { value: string; label: string };

type ProductFormProps = {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  values: ProductFormValues;
  brands: Option[];
  categories: (Option & { depth: number; path: string })[];
  attributes: { id: string; name: string; values: { id: string; value: string; colorHex: string | null }[] }[];
};

const STOCK_OPTIONS = [
  { value: "IN_STOCK", label: "Stokta" },
  { value: "LOW_STOCK", label: "Sınırlı stok" },
  { value: "OUT_OF_STOCK", label: "Tükendi" },
  { value: "PRE_ORDER", label: "Ön sipariş" },
  { value: "ASK_STORE", label: "Stok için danışın" },
];

export function ProductForm({ action, values, brands, categories, attributes }: ProductFormProps) {
  return (
    <AdminForm
      action={action}
      aside={
        <>
          <Panel title="Yayın">
            <Toggle name="isActive" label="Sitede yayında" defaultChecked={values.isActive} hint="Kapalıysa ürün sitede görünmez." />
            <TextField name="sortOrder" label="Sıralama" type="number" defaultValue={values.sortOrder} hint="Küçük sayı önce gösterilir." />
          </Panel>
          <Panel title="Rozetler & Vitrinler">
            <Toggle name="isNew" label="Yeni" defaultChecked={values.isNew} />
            <Toggle name="isBestSeller" label="Çok satan" defaultChecked={values.isBestSeller} />
            <Toggle name="isFeatured" label="Öne çıkan (ana sayfa)" defaultChecked={values.isFeatured} />
            <Toggle name="isCampaign" label="Kampanyalı" defaultChecked={values.isCampaign} />
          </Panel>
          <Panel title="Fiyat & Stok">
            <TextField name="price" label="Fiyat (₺)" defaultValue={values.price} placeholder="Örn. 12500" />
            <TextField name="salePrice" label="İndirimli fiyat (₺)" defaultValue={values.salePrice} hint="Boş bırakılırsa indirim gösterilmez." />
            <Toggle name="showPrice" label="Fiyatı sitede göster" defaultChecked={values.showPrice} hint="Kapalıysa “Fiyat bilgisi için danışın” yazar." />
            <SelectField name="stockStatus" label="Stok durumu" defaultValue={values.stockStatus} options={STOCK_OPTIONS} />
          </Panel>
          <Panel title="Marka & Kategori">
            <SelectField name="brandId" label="Marka" defaultValue={values.brandId} options={brands} emptyLabel="Marka seçilmedi" />
            <SelectField
              name="primaryCategoryId"
              label="Ana kategori"
              defaultValue={values.primaryCategoryId}
              options={categories.map((category) => ({ value: category.value, label: category.path }))}
              emptyLabel="Seçiniz"
              hint="Breadcrumb ve benzer ürünler bu kategoriye göre oluşur."
            />
            <CheckboxList
              name="categoryIds"
              label="Ek kategoriler"
              hint="Ürün birden fazla kategoride listelenebilir."
              options={categories.map((category) => ({ value: category.value, label: category.label, depth: category.depth }))}
              defaultValues={values.categoryIds}
            />
          </Panel>
        </>
      }
    >
      <Panel title="Temel bilgiler">
        <TextField name="name" label="Ürün adı" required defaultValue={values.name} maxLength={190} />
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="sku" label="Ürün kodu (SKU)" required defaultValue={values.sku} hint="WhatsApp mesajında gösterilir." />
          <TextField name="slug" label="URL (slug)" defaultValue={values.slug} hint="Boş bırakılırsa ürün adından üretilir." />
        </div>
        <SelectField
          name="kind"
          label="Ürün tipi"
          defaultValue={values.kind}
          options={[
            { value: "STANDARD", label: "Standart ürün" },
            { value: "FURNITURE_SET", label: "Mobilya / oda takımı" },
          ]}
        />
        <TextArea name="shortDescription" label="Kısa açıklama" defaultValue={values.shortDescription} rows={2} hint="Ürün başlığının altında görünür (en fazla 500 karakter)." />
        <TextArea name="description" label="Ürün açıklaması" defaultValue={values.description} rows={7} hint="Paragrafları boş satırla ayırın." />
      </Panel>

      <Panel title="Görseller" description="İlk sıradaki ya da yıldızlı görsel kapak olarak kullanılır.">
        <ProductImagesField defaultValue={values.images} />
      </Panel>

      <Panel title="Özellikler" description="Seçtiğiniz değerler kategori filtrelerinde ve ürün özelliklerinde kullanılır.">
        <div className="grid gap-5 md:grid-cols-2">
          {attributes.map((attribute) => (
            <CheckboxList
              key={attribute.id}
              name="attributeValueIds"
              label={attribute.name}
              options={attribute.values.map((value) => ({ value: value.id, label: value.value }))}
              defaultValues={values.attributeValueIds}
            />
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="ageRange" label="Yaş aralığı" defaultValue={values.ageRange} placeholder="Örn. 0 – 22 kg" />
          <TextField name="material" label="Malzeme" defaultValue={values.material} />
        </div>
        <TextField name="tags" label="Arama etiketleri" defaultValue={values.tags} hint="Virgülle ayırın; sitede görünmez, aramada kullanılır." />
      </Panel>

      <Panel title="Teknik detaylar">
        <TextArea name="specs" label="Teknik özellikler" defaultValue={values.specs} rows={5} hint="Her satır “Etiket: Değer” biçiminde. Örn. Ağırlık: 9,8 kg" />
        <TextArea name="dimensions" label="Ölçüler" defaultValue={values.dimensions} rows={4} hint="Her satır “Etiket: Değer”. Örn. Açık ölçü: 85 × 60 × 105 cm" />
        <TextArea name="setItems" label="Takım içeriği (mobilya)" defaultValue={values.setItems} rows={4} hint="Her satır “Parça | Ölçü”. Örn. Beşik | 70 × 140 cm" />
        <TextArea name="variants" label="Renk / seçenekler" defaultValue={values.variants} rows={3} hint="Her satır “Ad | #renkkodu”. Örn. Bej | #d9c7ae" />
      </Panel>

      <Panel title="Teslimat & Garanti" description="Boş bırakılırsa site ayarlarındaki genel metin kullanılır.">
        <TextArea name="deliveryInfo" label="Teslimat bilgisi" defaultValue={values.deliveryInfo} rows={3} />
        <TextArea name="warrantyInfo" label="Garanti bilgisi" defaultValue={values.warrantyInfo} rows={3} />
      </Panel>

      <Panel title="SEO">
        <TextField name="seoTitle" label="SEO başlığı" defaultValue={values.seoTitle} maxLength={190} hint="Boşsa “Ürün adı | Bebbek AVM” kullanılır." />
        <TextArea name="seoDescription" label="SEO açıklaması" defaultValue={values.seoDescription} rows={2} hint="150–160 karakter önerilir." />
      </Panel>
    </AdminForm>
  );
}
