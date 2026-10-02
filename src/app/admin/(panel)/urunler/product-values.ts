import type { ProductFormValues } from "@/components/admin/product-form";
import { rowsToText, setItemsToText, variantsToText } from "@/lib/admin/lines";
import { parseRows, parseSetItems, toNumber, type ProductDetail } from "@/lib/catalog/products";

export const EMPTY_PRODUCT: ProductFormValues = {
  name: "",
  slug: "",
  sku: "",
  kind: "STANDARD",
  brandId: null,
  primaryCategoryId: null,
  categoryIds: [],
  price: "",
  salePrice: "",
  showPrice: true,
  stockStatus: "IN_STOCK",
  isNew: false,
  isBestSeller: false,
  isFeatured: false,
  isCampaign: false,
  isActive: true,
  sortOrder: 0,
  shortDescription: "",
  description: "",
  ageRange: "",
  material: "",
  tags: "",
  deliveryInfo: "",
  warrantyInfo: "",
  seoTitle: "",
  seoDescription: "",
  specs: "",
  dimensions: "",
  setItems: "",
  variants: "",
  attributeValueIds: [],
  images: [],
};

const money = (value: Parameters<typeof toNumber>[0]) => {
  const number = toNumber(value);
  return number === null ? "" : String(number);
};

export function toProductFormValues(product: ProductDetail): ProductFormValues {
  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    kind: product.kind,
    brandId: product.brandId,
    primaryCategoryId: product.primaryCategoryId,
    categoryIds: product.categories.map((item) => item.categoryId).filter((id) => id !== product.primaryCategoryId),
    price: money(product.price),
    salePrice: money(product.salePrice),
    showPrice: product.showPrice,
    stockStatus: product.stockStatus,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    isFeatured: product.isFeatured,
    isCampaign: product.isCampaign,
    isActive: product.isActive,
    sortOrder: product.sortOrder,
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    ageRange: product.ageRange ?? "",
    material: product.material ?? "",
    tags: product.tags ?? "",
    deliveryInfo: product.deliveryInfo ?? "",
    warrantyInfo: product.warrantyInfo ?? "",
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    specs: rowsToText(parseRows(product.specs)),
    dimensions: rowsToText(parseRows(product.dimensions)),
    setItems: setItemsToText(parseSetItems(product.setItems)),
    variants: variantsToText(product.variants),
    attributeValueIds: product.attributeValues.map((item) => item.attributeValueId),
    images: product.images.map((image) => ({ url: image.url, alt: image.alt ?? "", width: image.width, height: image.height, isPrimary: image.isPrimary })),
  };
}
