"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { bool, fail, imageUrlSchema, int, isUniqueViolation, optionalRecordId, optStr, recordId, revalidateSite, str, zodErrors, type ActionState } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { slugify } from "@/lib/text";

const brandSchema = z.object({
  name: z.string().min(2, "Marka adı en az 2 karakter olmalı.").max(190),
  slug: z.string().regex(/^[a-z0-9-]{2,120}$/, "Slug yalnızca küçük harf, rakam ve tire içerebilir."),
  logoUrl: imageUrlSchema.nullable(),
  description: z.string().max(5000).nullable(),
  seoTitle: z.string().max(190).nullable(),
  seoDescription: z.string().max(320).nullable(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  sortOrder: z.number().int(),
});

export async function saveBrand(brandId: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  brandId = optionalRecordId(brandId);
  const name = str(form, "name");
  const parsed = brandSchema.safeParse({
    name,
    slug: slugify(str(form, "slug") || name),
    logoUrl: optStr(form, "logoUrl"),
    description: optStr(form, "description"),
    seoTitle: optStr(form, "seoTitle"),
    seoDescription: optStr(form, "seoDescription"),
    isActive: bool(form, "isActive"),
    isFeatured: bool(form, "isFeatured"),
    sortOrder: int(form, "sortOrder"),
  });
  if (!parsed.success) return fail("Lütfen işaretli alanları düzeltin.", zodErrors(parsed.error));

  let savedId: string;
  try {
    const brand = brandId ? await db.brand.update({ where: { id: brandId }, data: parsed.data }) : await db.brand.create({ data: parsed.data });
    savedId = brand.id;
  } catch (error) {
    if (isUniqueViolation(error)) return fail("Bu slug başka bir markada kullanılıyor.", { slug: "Benzersiz olmalı." });
    throw error;
  }

  revalidateSite();
  if (!brandId) redirect(`/admin/markalar/${savedId}?kaydedildi=1`);
  return { ok: true, message: "Marka kaydedildi." };
}

export async function deleteBrand(brandId: string) {
  await requireAdmin();
  brandId = recordId(brandId);
  await db.brand.delete({ where: { id: brandId } });
  revalidateSite();
  redirect("/admin/markalar");
}
