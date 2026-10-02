import { db } from "@/lib/db";
import { getCategoryIndex, getDescendantIds, type CategoryNode } from "@/lib/catalog/categories";
import { hasActiveFilters, parseFilters, type FilterState, type RawSearchParams } from "@/lib/catalog/filters";
import { getFacets, listProducts, type Facets, type ListingResult, type ListingScope } from "@/lib/catalog/products";

export type CategoryOption = { slug: string; label: string };

export type ListingData = {
  state: FilterState;
  result: ListingResult;
  facets: Facets;
  categoryOptions: CategoryOption[];
  isFiltered: boolean;
};

/** Kategorinin kendisine ve atalarına bağlı filtrelenebilir özellikler. */
export async function getCategoryAttributeIds(node: CategoryNode | null): Promise<string[]> {
  if (!node) {
    const all = await db.attribute.findMany({ where: { isFilterable: true }, select: { id: true } });
    return all.map((item) => item.id);
  }
  const index = await getCategoryIndex();
  const chain: string[] = [];
  let current: CategoryNode | undefined = node;
  while (current) {
    chain.push(current.id);
    current = current.parentId ? index.byId.get(current.parentId) : undefined;
  }
  const links = await db.categoryAttribute.findMany({
    where: { categoryId: { in: chain }, attribute: { isFilterable: true } },
    select: { attributeId: true },
    orderBy: { sortOrder: "asc" },
  });
  return [...new Set(links.map((link) => link.attributeId))];
}

type LoadListingInput = {
  scope: ListingScope;
  params: RawSearchParams;
  category?: CategoryNode | null;
  categoryOptions?: CategoryNode[];
};

export async function loadListing({ scope, params, category = null, categoryOptions = [] }: LoadListingInput): Promise<ListingData> {
  const attributeIds = await getCategoryAttributeIds(category);
  const attributeSlugs = attributeIds.length
    ? (await db.attribute.findMany({ where: { id: { in: attributeIds } }, select: { slug: true } })).map((item) => item.slug)
    : [];
  const state = parseFilters(params, attributeSlugs);

  const optionBySlug = new Map(categoryOptions.map((node) => [node.slug, node]));
  const selectedCategoryIds = state.categories.flatMap((slug) => {
    const node = optionBySlug.get(slug);
    return node ? getDescendantIds(node) : [];
  });

  const [result, facets] = await Promise.all([listProducts(scope, state, selectedCategoryIds), getFacets(scope, attributeIds)]);

  return {
    state,
    result,
    facets,
    categoryOptions: categoryOptions.map((node) => ({ slug: node.slug, label: node.name })),
    isFiltered: hasActiveFilters(state) || state.sort !== "recommended" || state.page > 1,
  };
}
