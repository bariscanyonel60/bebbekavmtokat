import { cache } from "react";
import { db } from "@/lib/db";

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  tagline: string | null;
  description: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  icon: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  sortOrder: number;
  showInMenu: boolean;
  isPopular: boolean;
  popularLabel: string | null;
  isHomeFeatured: boolean;
  homeSortOrder: number;
  children: CategoryNode[];
};

export type CategoryIndex = {
  roots: CategoryNode[];
  byId: Map<string, CategoryNode>;
  bySlug: Map<string, CategoryNode>;
};

/** Tüm aktif kategorileri tek sorguda çekip bellekte ağaç kurar. Kategori derinliği sınırsızdır. */
export const getCategoryIndex = cache(async (): Promise<CategoryIndex> => {
  const rows = await db.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const byId = new Map<string, CategoryNode>();
  const bySlug = new Map<string, CategoryNode>();
  for (const row of rows) {
    const node: CategoryNode = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      parentId: row.parentId,
      tagline: row.tagline,
      description: row.description,
      imageUrl: row.imageUrl,
      bannerUrl: row.bannerUrl,
      icon: row.icon,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      sortOrder: row.sortOrder,
      showInMenu: row.showInMenu,
      isPopular: row.isPopular,
      popularLabel: row.popularLabel,
      isHomeFeatured: row.isHomeFeatured,
      homeSortOrder: row.homeSortOrder,
      children: [],
    };
    byId.set(node.id, node);
    bySlug.set(node.slug, node);
  }

  const roots: CategoryNode[] = [];
  for (const node of byId.values()) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else if (!node.parentId) roots.push(node);
  }

  return { roots, byId, bySlug };
});

export function getAncestors(index: CategoryIndex, node: CategoryNode): CategoryNode[] {
  const chain: CategoryNode[] = [];
  let current = node.parentId ? index.byId.get(node.parentId) : undefined;
  while (current) {
    chain.unshift(current);
    current = current.parentId ? index.byId.get(current.parentId) : undefined;
  }
  return chain;
}

export function getDescendantIds(node: CategoryNode): string[] {
  const ids = [node.id];
  for (const child of node.children) ids.push(...getDescendantIds(child));
  return ids;
}

export async function getMenuCategories(): Promise<CategoryNode[]> {
  const { roots } = await getCategoryIndex();
  return roots.filter((root) => root.showInMenu);
}

export async function getPopularCategories(): Promise<CategoryNode[]> {
  const { byId } = await getCategoryIndex();
  return [...byId.values()].filter((node) => node.isPopular).sort((a, b) => a.homeSortOrder - b.homeSortOrder);
}

export async function getHomeFeaturedCategories(): Promise<CategoryNode[]> {
  const { byId } = await getCategoryIndex();
  return [...byId.values()]
    .filter((node) => node.isHomeFeatured)
    .sort((a, b) => a.homeSortOrder - b.homeSortOrder);
}
