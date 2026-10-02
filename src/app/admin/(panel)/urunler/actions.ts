"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { bool, decimal, fail, imageUrlSchema, int, isUniqueViolation, list, optionalRecordId, optStr, recordId, revalidateSite, str, zodErrors, type ActionState } from "@/lib/admin/form";
import { parseRowsText, parseSetItemsText, parseVariantsText } from "@/lib/admin/lines";
import { requireAdmin } from "@/lib/auth/session";
import { refreshProductSearchText } from "@/lib/catalog/search-text";
import { db } from "@/lib/db";
import { slugify } from "@/lib/text";

const imageSchema = z.object({
  url: imageUrlSchema.refine((value) => value.length > 0, "Görsel adresi boş olamaz."),
  alt: z.string().max(200).default(""),
  width: z.number().int().positive().nullable().default(null),
  height: z.number().int().positive().nullable().default(null),
  isPrimary: z.boolean().default(false),
});

const productSchema = z
  .object({
    name: z.string().min(2, "Ürün adı en az 2 karakter olmalı.").max(190),
    slug: z.string().regex(/^[a-z0-9-]{2,120}$/, "Slug yalnızca küçük harf, rakam ve tire içerebilir."),
    sku: z.string().min(2, "Ürün kodu gerekli.").max(64),
    kind: z.enum(["STANDARD", "FURNITURE_SET"]),
    brandId: z.string().nullable(),
    primaryCategoryId: z.string().nullable(),
    categoryIds: z.array(z.string()).max(30),
    price: z.number().nullable(),
    salePrice: z.number().nullable(),
    showPrice: z.boolean(),
    stockStatus: z.enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "PRE_ORDER", "ASK_STORE"]),
    isNew: z.boolean(),
    isBestSeller: z.boolean(),
    isFeatured: z.boolean(),
    isCampaign: z.boolean(),
    isActive: z.boolean(),
    sortOrder: z.number().int(),
    shortDescription: z.string().max(500).nullable(),
    description: z.string().max(20000).nullable(),
    ageRange: z.string().max(190).nullable(),
    material: z.string().max(190).nullable(),
    tags: z.string().max(500).nullable(),
    deliveryInfo: z.string().max(4000).nullable(),
    warrantyInfo: z.string().max(4000).nullable(),
    seoTitle: z.string().max(190).nullable(),
    seoDescription: z.string().max(320).nullable(),
    attributeValueIds: z.array(z.string()).max(100),
    images: z.array(imageSchema).max(20, "En fazla 20 görsel eklenebilir."),
  })
  .refine((data) => data.salePrice === null || data.price === null || data.salePrice < data.price, {
    message: "İndirimli fiyat, normal fiyattan düşük olmalı.",
    path: ["salePrice"],
  })
  .refine((data) => !data.showPrice || data.price !== null, { message: "Fiyat gösterilecekse fiyat girilmeli.", path: ["price"] });

function parseImages(raw: string): unknown {
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

export async function saveProduct(productId: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  productId = optionalRecordId(productId);

  const name = str(form, "name");
  const parsed = productSchema.safeParse({
    name,
    slug: slugify(str(form, "slug") || name),
    sku: str(form, "sku").toUpperCase(),
    kind: str(form, "kind") || "STANDARD",
    brandId: optStr(form, "brandId"),
    primaryCategoryId: optStr(form, "primaryCategoryId"),
    categoryIds: list(form, "categoryIds"),
    price: decimal(form, "price"),
    salePrice: decimal(form, "salePrice"),
    showPrice: bool(form, "showPrice"),
    stockStatus: str(form, "stockStatus") || "IN_STOCK",
    isNew: bool(form, "isNew"),
    isBestSeller: bool(form, "isBestSeller"),
    isFeatured: bool(form, "isFeatured"),
    isCampaign: bool(form, "isCampaign"),
    isActive: bool(form, "isActive"),
    sortOrder: int(form, "sortOrder"),
    shortDescription: optStr(form, "shortDescription"),
    description: optStr(form, "description"),
    ageRange: optStr(form, "ageRange"),
    material: optStr(form, "material"),
    tags: optStr(form, "tags"),
    deliveryInfo: optStr(form, "deliveryInfo"),
    warrantyInfo: optStr(form, "warrantyInfo"),
    seoTitle: optStr(form, "seoTitle"),
    seoDescription: optStr(form, "seoDescription"),
    attributeValueIds: list(form, "attributeValueIds"),
    images: parseImages(str(form, "images")),
  });
  if (!parsed.success) return fail("Lütfen işaretli alanları düzeltin.", zodErrors(parsed.error));

  const data = parsed.data;
  const specs = parseRowsText(str(form, "specs"));
  const dimensions = parseRowsText(str(form, "dimensions"));
  const setItems = parseSetItemsText(str(form, "setItems"));
  const variants = parseVariantsText(str(form, "variants"));
  const categoryIds = [...new Set([...(data.primaryCategoryId ? [data.primaryCategoryId] : []), ...data.categoryIds])];
  const primaryIndex = Math.max(0, data.images.findIndex((image) => image.isPrimary));

  const fields = {
    name: data.name,
    slug: data.slug,
    sku: data.sku,
    kind: data.kind,
    brandId: data.brandId,
    primaryCategoryId: data.primaryCategoryId,
    price: data.price,
    salePrice: data.salePrice,
    showPrice: data.showPrice,
    stockStatus: data.stockStatus,
    isNew: data.isNew,
    isBestSeller: data.isBestSeller,
    isFeatured: data.isFeatured,
    isCampaign: data.isCampaign,
    isActive: data.isActive,
    sortOrder: data.sortOrder,
    shortDescription: data.shortDescription,
    description: data.description,
    ageRange: data.ageRange,
    material: data.material,
    tags: data.tags,
    deliveryInfo: data.deliveryInfo,
    warrantyInfo: data.warrantyInfo,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    specs,
    dimensions,
    setItems,
  };

  let savedId: string;
  try {
    savedId = await db.$transaction(async (tx) => {
      const product = productId
        ? await tx.product.update({ where: { id: productId }, data: fields })
        : await tx.product.create({ data: fields });

      await tx.productCategory.deleteMany({ where: { productId: product.id } });
      if (categoryIds.length) await tx.productCategory.createMany({ data: categoryIds.map((categoryId, index) => ({ productId: product.id, categoryId, sortOrder: index })) });

      await tx.productImage.deleteMany({ where: { productId: product.id } });
      if (data.images.length) {
        await tx.productImage.createMany({
          data: data.images.map((image, index) => ({
            productId: product.id,
            url: image.url,
            alt: image.alt || null,
            width: image.width,
            height: image.height,
            sortOrder: index,
            isPrimary: index === primaryIndex,
          })),
        });
      }

      await tx.productAttributeValue.deleteMany({ where: { productId: product.id } });
      if (data.attributeValueIds.length) {
        await tx.productAttributeValue.createMany({ data: [...new Set(data.attributeValueIds)].map((attributeValueId) => ({ productId: product.id, attributeValueId })) });
      }

      await tx.productVariant.deleteMany({ where: { productId: product.id } });
      if (variants.length) {
        await tx.productVariant.createMany({ data: variants.map((variant, index) => ({ productId: product.id, name: variant.name, colorHex: variant.colorHex, sortOrder: index })) });
      }
      return product.id;
    });
  } catch (error) {
    if (isUniqueViolation(error)) return fail("Bu slug veya ürün kodu başka bir üründe kullanılıyor.", { slug: "Benzersiz olmalı.", sku: "Benzersiz olmalı." });
    throw error;
  }

  await refreshProductSearchText(db, savedId);
  revalidateSite();
  if (!productId) redirect(`/admin/urunler/${savedId}?kaydedildi=1`);
  return { ok: true, message: "Ürün kaydedildi." };
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  productId = recordId(productId);
  await db.product.delete({ where: { id: productId } });
  revalidateSite();
  redirect("/admin/urunler");
}

export async function duplicateProduct(productId: string) {
  await requireAdmin();
  productId = recordId(productId);
  const source = await db.product.findUnique({ where: { id: productId }, include: { categories: true, images: true, attributeValues: true, variants: true } });
  if (!source) redirect("/admin/urunler");

  const suffix = Date.now().toString(36).slice(-4);
  const copy = await db.product.create({
    data: {
      name: `${source.name} (Kopya)`,
      slug: `${source.slug}-kopya-${suffix}`,
      sku: `${source.sku}-K${suffix}`.toUpperCase().slice(0, 64),
      kind: source.kind,
      brandId: source.brandId,
      primaryCategoryId: source.primaryCategoryId,
      price: source.price,
      salePrice: source.salePrice,
      showPrice: source.showPrice,
      stockStatus: source.stockStatus,
      shortDescription: source.shortDescription,
      description: source.description,
      specs: source.specs ?? undefined,
      dimensions: source.dimensions ?? undefined,
      setItems: source.setItems ?? undefined,
      ageRange: source.ageRange,
      material: source.material,
      tags: source.tags,
      deliveryInfo: source.deliveryInfo,
      warrantyInfo: source.warrantyInfo,
      isActive: false,
      categories: { create: source.categories.map((item) => ({ categoryId: item.categoryId, sortOrder: item.sortOrder })) },
      images: { create: source.images.map(({ url, alt, width, height, sortOrder, isPrimary }) => ({ url, alt, width, height, sortOrder, isPrimary })) },
      attributeValues: { create: source.attributeValues.map((item) => ({ attributeValueId: item.attributeValueId })) },
      variants: { create: source.variants.map(({ name, colorHex, imageUrl, price, stockStatus, sortOrder }) => ({ name, colorHex, imageUrl, price, stockStatus, sortOrder })) },
    },
  });
  await refreshProductSearchText(db, copy.id);
  redirect(`/admin/urunler/${copy.id}?kaydedildi=1`);
}
