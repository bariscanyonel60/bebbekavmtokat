import "server-only";
import { db } from "@/lib/db";

export type CategoryOption = { value: string; label: string; depth: number; path: string; isActive: boolean };

/** Pasif olanlar dahil tüm kategorileri ağaç sırasında, derinlik bilgisiyle döndürür. */
export async function getAdminCategoryOptions(): Promise<CategoryOption[]> {
  const rows = await db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, parentId: true, isActive: true } });
  const children = new Map<string | null, typeof rows>();
  for (const row of rows) {
    const key = row.parentId && rows.some((item) => item.id === row.parentId) ? row.parentId : null;
    children.set(key, [...(children.get(key) ?? []), row]);
  }
  const result: CategoryOption[] = [];
  const walk = (parentId: string | null, depth: number, trail: string[]) => {
    for (const row of children.get(parentId) ?? []) {
      const path = [...trail, row.name];
      result.push({ value: row.id, label: row.name, depth, path: path.join(" › "), isActive: row.isActive });
      walk(row.id, depth + 1, path);
    }
  };
  walk(null, 0, []);
  return result;
}

export async function getBrandOptions() {
  const brands = await db.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return brands.map((brand) => ({ value: brand.id, label: brand.name }));
}

export async function getAttributeGroups() {
  return db.attribute.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, values: { orderBy: { sortOrder: "asc" }, select: { id: true, value: true, colorHex: true } } },
  });
}
