import { cache } from "react";
import type { Prisma, StockStatus, ProductKind } from "@prisma/client";
import { db } from "@/lib/db";
import { searchTokens } from "@/lib/text";
import type { FilterState } from "@/lib/catalog/filters";

export const PAGE_SIZE = 24;

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  kind: ProductKind;
  brand: { name: string; slug: string } | null;
  category: { name: string; slug: string } | null;
  image: { url: string; alt: string } | null;
  hoverImage: { url: string; alt: string } | null;
  price: number | null;
  salePrice: number | null;
  showPrice: boolean;
  stockStatus: StockStatus;
  isNew: boolean;
  isBestSeller: boolean;
  isCampaign: boolean;
};

export const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  kind: true,
  price: true,
  salePrice: true,
  showPrice: true,
  stockStatus: true,
  isNew: true,
  isBestSeller: true,
  isCampaign: true,
  brand: { select: { name: true, slug: true } },
  primaryCategory: { select: { name: true, slug: true } },
  images: {
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
    take: 2,
    select: { url: true, alt: true },
  },
} satisfies Prisma.ProductSelect;

type ProductCardRow = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

export function toNumber(value: Prisma.Decimal | null | undefined): number | null {
  return value === null || value === undefined ? null : Number(value);
}

export function toProductCard(row: ProductCardRow): ProductCardData {
  const [primary, secondary] = row.images;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    kind: row.kind,
    brand: row.brand,
    category: row.primaryCategory,
    image: primary ? { url: primary.url, alt: primary.alt ?? row.name } : null,
    hoverImage: secondary ? { url: secondary.url, alt: secondary.alt ?? row.name } : null,
    price: toNumber(row.price),
    salePrice: toNumber(row.salePrice),
    showPrice: row.showPrice,
    stockStatus: row.stockStatus,
    isNew: row.isNew,
    isBestSeller: row.isBestSeller,
    isCampaign: row.isCampaign,
  };
}

export type ProductFlag = "isFeatured" | "isBestSeller" | "isNew" | "isCampaign";

export async function getProductsByFlag(flag: ProductFlag, take = 8): Promise<ProductCardData[]> {
  const rows = await db.product.findMany({
    where: { isActive: true, [flag]: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take,
    select: productCardSelect,
  });
  return rows.map(toProductCard);
}

export async function getProductsByIds(ids: string[]): Promise<ProductCardData[]> {
  if (ids.length === 0) return [];
  const rows = await db.product.findMany({
    where: { isActive: true, id: { in: ids.slice(0, 60) } },
    select: productCardSelect,
  });
  const order = new Map(ids.map((id, index) => [id, index]));
  return rows.map(toProductCard).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export type ListingScope = {
  categoryIds?: string[];
  brandId?: string;
  campaignOnly?: boolean;
};

export function buildScopeWhere(scope: ListingScope): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };
  if (scope.categoryIds?.length) where.categories = { some: { categoryId: { in: scope.categoryIds } } };
  if (scope.brandId) where.brandId = scope.brandId;
  if (scope.campaignOnly) where.isCampaign = true;
  return where;
}

export function buildSearchWhere(query: string): Prisma.ProductWhereInput[] {
  return searchTokens(query).map((token) => ({ searchText: { contains: token } }));
}

function buildFilterWhere(state: FilterState, subCategoryIds: string[]): Prisma.ProductWhereInput[] {
  const and: Prisma.ProductWhereInput[] = [];
  if (subCategoryIds.length) and.push({ categories: { some: { categoryId: { in: subCategoryIds } } } });
  if (state.brands.length) and.push({ brand: { slug: { in: state.brands } } });
  for (const [attributeSlug, valueSlugs] of Object.entries(state.attributes)) {
    and.push({
      attributeValues: {
        some: { attributeValue: { slug: { in: valueSlugs }, attribute: { slug: attributeSlug } } },
      },
    });
  }
  if (state.minPrice !== null || state.maxPrice !== null) {
    const range: Prisma.DecimalNullableFilter = {};
    if (state.minPrice !== null) range.gte = state.minPrice;
    if (state.maxPrice !== null) range.lte = state.maxPrice;
    and.push({
      showPrice: true,
      OR: [{ salePrice: range }, { salePrice: null, price: range }],
    });
  }
  if (state.inStock) and.push({ stockStatus: { in: ["IN_STOCK", "LOW_STOCK"] } });
  if (state.campaign) and.push({ isCampaign: true });
  if (state.isNew) and.push({ isNew: true });
  if (state.q) and.push(...buildSearchWhere(state.q));
  return and;
}

function buildOrderBy(sort: FilterState["sort"]): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }];
    case "price-asc":
      return [{ price: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }];
    case "price-desc":
      return [{ price: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }];
    case "name":
      return [{ name: "asc" }];
    case "recommended":
      return [{ isFeatured: "desc" }, { isBestSeller: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }];
    default: {
      const exhaustive: never = sort;
      return exhaustive;
    }
  }
}

export type ListingResult = {
  items: ProductCardData[];
  total: number;
  page: number;
  pageCount: number;
};

export async function listProducts(
  scope: ListingScope,
  state: FilterState,
  subCategoryIds: string[] = [],
): Promise<ListingResult> {
  const where: Prisma.ProductWhereInput = {
    AND: [buildScopeWhere(scope), ...buildFilterWhere(state, subCategoryIds)],
  };
  const [total, rows] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: buildOrderBy(state.sort),
      skip: (state.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: productCardSelect,
    }),
  ]);
  return {
    items: rows.map(toProductCard),
    total,
    page: state.page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export type FacetOption = { slug: string; label: string; count: number; colorHex?: string | null };
export type AttributeFacet = { slug: string; name: string; type: "SELECT" | "BOOLEAN" | "COLOR"; options: FacetOption[] };
export type Facets = {
  brands: FacetOption[];
  attributes: AttributeFacet[];
  priceRange: { min: number; max: number } | null;
};

/** Mevcut kapsamdaki ürünlere göre marka/özellik seçeneklerini ve adetlerini hesaplar. */
export async function getFacets(scope: ListingScope, attributeIds: string[]): Promise<Facets> {
  const scopeWhere = buildScopeWhere(scope);

  const [brandGroups, valueGroups, priceAgg] = await Promise.all([
    db.product.groupBy({ by: ["brandId"], where: { ...scopeWhere, brandId: { not: null } }, _count: { _all: true } }),
    db.productAttributeValue.groupBy({
      by: ["attributeValueId"],
      where: { product: scopeWhere, attributeValue: { attributeId: { in: attributeIds } } },
      _count: { _all: true },
    }),
    db.product.aggregate({ where: { ...scopeWhere, showPrice: true, price: { not: null } }, _min: { price: true }, _max: { price: true } }),
  ]);

  const brandIds = brandGroups.map((group) => group.brandId).filter((id): id is string => Boolean(id));
  const valueIds = valueGroups.map((group) => group.attributeValueId);

  const [brands, values] = await Promise.all([
    brandIds.length
      ? db.brand.findMany({ where: { id: { in: brandIds }, isActive: true }, orderBy: { name: "asc" } })
      : Promise.resolve([]),
    valueIds.length
      ? db.attributeValue.findMany({
          where: { id: { in: valueIds } },
          include: { attribute: true },
          orderBy: [{ attribute: { sortOrder: "asc" } }, { sortOrder: "asc" }],
        })
      : Promise.resolve([]),
  ]);

  const brandCount = new Map(brandGroups.map((group) => [group.brandId, group._count._all]));
  const valueCount = new Map(valueGroups.map((group) => [group.attributeValueId, group._count._all]));

  const attributeMap = new Map<string, AttributeFacet>();
  for (const value of values) {
    if (!value.attribute.isFilterable) continue;
    let facet = attributeMap.get(value.attribute.slug);
    if (!facet) {
      facet = { slug: value.attribute.slug, name: value.attribute.name, type: value.attribute.type, options: [] };
      attributeMap.set(value.attribute.slug, facet);
    }
    facet.options.push({ slug: value.slug, label: value.value, count: valueCount.get(value.id) ?? 0, colorHex: value.colorHex });
  }

  const min = toNumber(priceAgg._min.price);
  const max = toNumber(priceAgg._max.price);

  return {
    brands: brands.map((brand) => ({ slug: brand.slug, label: brand.name, count: brandCount.get(brand.id) ?? 0 })),
    attributes: [...attributeMap.values()],
    priceRange: min !== null && max !== null ? { min: Math.floor(min), max: Math.ceil(max) } : null,
  };
}

export const productDetailInclude = {
  brand: true,
  primaryCategory: true,
  categories: { include: { category: true } },
  images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
  variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
  attributeValues: {
    include: { attributeValue: { include: { attribute: true } } },
  },
} satisfies Prisma.ProductInclude;

export const getProductBySlug = cache(async (slug: string) => {
  return db.product.findFirst({ where: { slug, isActive: true }, include: productDetailInclude });
});

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export async function getRelatedProducts(product: ProductDetail, take = 8) {
  const similarityOr: Prisma.ProductWhereInput[] = [];
  if (product.brandId) similarityOr.push({ brandId: product.brandId });
  if (product.attributeValues.length) {
    similarityOr.push({
      attributeValues: { some: { attributeValueId: { in: product.attributeValues.map((item) => item.attributeValueId) } } },
    });
  }
  const parentId = product.primaryCategory?.parentId;

  const [similar, sameCategory] = await Promise.all([
    db.product.findMany({
      where: {
        isActive: true,
        id: { not: product.id },
        ...(similarityOr.length ? { OR: similarityOr } : {}),
        ...(parentId ? { primaryCategory: { parentId } } : {}),
      },
      orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }],
      take,
      select: productCardSelect,
    }),
    product.primaryCategoryId
      ? db.product.findMany({
          where: { isActive: true, id: { not: product.id }, categories: { some: { categoryId: product.primaryCategoryId } } },
          orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
          take,
          select: productCardSelect,
        })
      : Promise.resolve([]),
  ]);

  const sameIds = new Set(sameCategory.map((item) => item.id));
  return {
    similar: similar.filter((item) => !sameIds.has(item.id)).map(toProductCard),
    sameCategory: sameCategory.map(toProductCard),
  };
}

export type SpecRow = { label: string; value: string };
export type SetItem = { name: string; dimensions: string };

export function parseRows(value: Prisma.JsonValue | null): SpecRow[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (item && typeof item === "object" && !Array.isArray(item) && "label" in item && "value" in item) {
      return [{ label: String(item.label), value: String(item.value) }];
    }
    return [];
  });
}

export function parseSetItems(value: Prisma.JsonValue | null): SetItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (item && typeof item === "object" && !Array.isArray(item) && "name" in item) {
      return [{ name: String(item.name), dimensions: "dimensions" in item ? String(item.dimensions ?? "") : "" }];
    }
    return [];
  });
}
