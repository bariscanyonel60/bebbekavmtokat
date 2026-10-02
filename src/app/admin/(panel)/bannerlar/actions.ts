"use server";

import { BannerPlacement, TextTheme } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";
import { bool, fail, hrefSchema, imageUrlSchema, int, optionalRecordId, optStr, recordId, revalidateSite, str, zodErrors, type ActionState } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

const bannerSchema = z.object({
  placement: z.enum(BannerPlacement),
  eyebrow: z.string().max(120).nullable(),
  title: z.string().min(2, "Başlık zorunlu.").max(190),
  description: z.string().max(500).nullable(),
  ctaLabel: z.string().max(60).nullable(),
  href: hrefSchema.nullable(),
  imageUrl: imageUrlSchema,
  mobileImageUrl: imageUrlSchema.nullable(),
  imageAlt: z.string().max(190).nullable(),
  textTheme: z.enum(TextTheme),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});

export async function saveBanner(bannerId: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  bannerId = optionalRecordId(bannerId);
  const parsed = bannerSchema.safeParse({
    placement: str(form, "placement"),
    eyebrow: optStr(form, "eyebrow"),
    title: str(form, "title"),
    description: optStr(form, "description"),
    ctaLabel: optStr(form, "ctaLabel"),
    href: optStr(form, "href"),
    imageUrl: str(form, "imageUrl"),
    mobileImageUrl: optStr(form, "mobileImageUrl"),
    imageAlt: optStr(form, "imageAlt"),
    textTheme: str(form, "textTheme"),
    sortOrder: int(form, "sortOrder"),
    isActive: bool(form, "isActive"),
  });
  if (!parsed.success) return fail("Lütfen işaretli alanları düzeltin.", zodErrors(parsed.error));

  const banner = bannerId ? await db.banner.update({ where: { id: bannerId }, data: parsed.data }) : await db.banner.create({ data: parsed.data });
  revalidateSite();
  if (!bannerId) redirect(`/admin/bannerlar/${banner.id}?kaydedildi=1`);
  return { ok: true, message: "Banner kaydedildi." };
}

export async function deleteBanner(bannerId: string) {
  await requireAdmin();
  bannerId = recordId(bannerId);
  await db.banner.delete({ where: { id: bannerId } });
  revalidateSite();
  redirect("/admin/bannerlar");
}
