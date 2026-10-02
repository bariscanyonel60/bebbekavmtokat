"use server";

import { TextTheme } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";
import { bool, fail, hrefSchema, imageUrlSchema, int, optionalRecordId, optStr, recordId, revalidateSite, str, zodErrors, type ActionState } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

const slideSchema = z.object({
  eyebrow: z.string().max(120).nullable(),
  title: z.string().min(2, "Başlık zorunlu.").max(190),
  description: z.string().max(500).nullable(),
  desktopImageUrl: imageUrlSchema,
  mobileImageUrl: imageUrlSchema.nullable(),
  imageAlt: z.string().max(190).nullable(),
  primaryCtaLabel: z.string().max(60).nullable(),
  primaryCtaHref: hrefSchema.nullable(),
  showWhatsappCta: z.boolean(),
  textTheme: z.enum(TextTheme),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});

export async function saveHeroSlide(slideId: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  slideId = optionalRecordId(slideId);
  const parsed = slideSchema.safeParse({
    eyebrow: optStr(form, "eyebrow"),
    title: str(form, "title"),
    description: optStr(form, "description"),
    desktopImageUrl: str(form, "desktopImageUrl"),
    mobileImageUrl: optStr(form, "mobileImageUrl"),
    imageAlt: optStr(form, "imageAlt"),
    primaryCtaLabel: optStr(form, "primaryCtaLabel"),
    primaryCtaHref: optStr(form, "primaryCtaHref"),
    showWhatsappCta: bool(form, "showWhatsappCta"),
    textTheme: str(form, "textTheme"),
    sortOrder: int(form, "sortOrder"),
    isActive: bool(form, "isActive"),
  });
  if (!parsed.success) return fail("Lütfen işaretli alanları düzeltin.", zodErrors(parsed.error));

  const slide = slideId ? await db.heroSlide.update({ where: { id: slideId }, data: parsed.data }) : await db.heroSlide.create({ data: parsed.data });
  revalidateSite();
  if (!slideId) redirect(`/admin/hero/${slide.id}?kaydedildi=1`);
  return { ok: true, message: "Slayt kaydedildi." };
}

export async function deleteHeroSlide(slideId: string) {
  await requireAdmin();
  slideId = recordId(slideId);
  await db.heroSlide.delete({ where: { id: slideId } });
  revalidateSite();
  redirect("/admin/hero");
}
