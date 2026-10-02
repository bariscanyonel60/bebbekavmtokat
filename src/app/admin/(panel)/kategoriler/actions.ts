"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { bool, fail, imageUrlSchema, int, isUniqueViolation, list, optionalRecordId, optStr, recordId, revalidateSite, str, zodErrors, type ActionState } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { slugify } from "@/lib/text";

const categorySchema = z.object({
  name: z.string().min(2, "Kategori adı en az 2 karakter olmalı.").max(190),
  slug: z.string().regex(/^[a-z0-9-]{2,120}$/, "Slug yalnızca küçük harf, rakam ve tire içerebilir."),
  parentId: z.string().nullable(),
  tagline: z.string().max(190).nullable(),
  description: z.string().max(5000).nullable(),
  imageUrl: imageUrlSchema.nullable(),
  bannerUrl: imageUrlSchema.nullable(),
  seoTitle: z.string().max(190).nullable(),
  seoDescription: z.string().max(320).nullable(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  showInMenu: z.boolean(),
  isPopular: z.boolean(),
  popularLabel: z.string().max(60).nullable(),
  isHomeFeatured: z.boolean(),
  homeSortOrder: z.number().int(),
  attributeIds: z.array(z.string()).max(40),
});

/** Bir kategori kendi alt ağacındaki bir düğüme taşınamaz (döngü oluşur). */
async function wouldCreateCycle(categoryId: string, parentId: string): Promise<boolean> {
  let current: string | null = parentId;
  const seen = new Set<string>();
  while (current && !seen.has(current)) {
    if (current === categoryId) return true;
    seen.add(current);
    const row: { parentId: string | null } | null = await db.category.findUnique({ where: { id: current }, select: { parentId: true } });
    current = row?.parentId ?? null;
  }
  return false;
}

export async function saveCategory(categoryId: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  categoryId = optionalRecordId(categoryId);
  const name = str(form, "name");
  const parsed = categorySchema.safeParse({
    name,
    slug: slugify(str(form, "slug") || name),
    parentId: optStr(form, "parentId"),
    tagline: optStr(form, "tagline"),
    description: optStr(form, "description"),
    imageUrl: optStr(form, "imageUrl"),
    bannerUrl: optStr(form, "bannerUrl"),
    seoTitle: optStr(form, "seoTitle"),
    seoDescription: optStr(form, "seoDescription"),
    sortOrder: int(form, "sortOrder"),
    isActive: bool(form, "isActive"),
    showInMenu: bool(form, "showInMenu"),
    isPopular: bool(form, "isPopular"),
    popularLabel: optStr(form, "popularLabel"),
    isHomeFeatured: bool(form, "isHomeFeatured"),
    homeSortOrder: int(form, "homeSortOrder"),
    attributeIds: list(form, "attributeIds"),
  });
  if (!parsed.success) return fail("Lütfen işaretli alanları düzeltin.", zodErrors(parsed.error));
  const { attributeIds, ...data } = parsed.data;

  if (categoryId && data.parentId && (await wouldCreateCycle(categoryId, data.parentId))) {
    return fail("Kategori kendi alt kategorisinin altına taşınamaz.", { parentId: "Geçersiz üst kategori." });
  }

  let savedId: string;
  try {
    savedId = await db.$transaction(async (tx) => {
      const category = categoryId ? await tx.category.update({ where: { id: categoryId }, data }) : await tx.category.create({ data });
      await tx.categoryAttribute.deleteMany({ where: { categoryId: category.id } });
      if (attributeIds.length) await tx.categoryAttribute.createMany({ data: attributeIds.map((attributeId, index) => ({ categoryId: category.id, attributeId, sortOrder: index })) });
      return category.id;
    });
  } catch (error) {
    if (isUniqueViolation(error)) return fail("Bu slug başka bir kategoride kullanılıyor.", { slug: "Benzersiz olmalı." });
    throw error;
  }

  revalidateSite();
  if (!categoryId) redirect(`/admin/kategoriler/${savedId}?kaydedildi=1`);
  return { ok: true, message: "Kategori kaydedildi." };
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  categoryId = recordId(categoryId);
  const childCount = await db.category.count({ where: { parentId: categoryId } });
  if (childCount > 0) redirect(`/admin/kategoriler/${categoryId}?hata=alt-kategori`);
  await db.category.delete({ where: { id: categoryId } });
  revalidateSite();
  redirect("/admin/kategoriler");
}

export async function moveCategory(categoryId: string, direction: "up" | "down") {
  await requireAdmin();
  categoryId = recordId(categoryId);
  if (direction !== "up" && direction !== "down") return;
  const category = await db.category.findUnique({ where: { id: categoryId }, select: { parentId: true } });
  if (!category) return;
  const siblings = await db.category.findMany({ where: { parentId: category.parentId }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true } });
  const index = siblings.findIndex((item) => item.id === categoryId);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= siblings.length) return;
  [siblings[index], siblings[target]] = [siblings[target], siblings[index]];
  await db.$transaction(siblings.map((item, order) => db.category.update({ where: { id: item.id }, data: { sortOrder: order } })));
  revalidateSite();
}
