"use server";

import { fail, optStr, revalidateSite, type ActionState } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { HOME_SECTION_LABELS } from "@/lib/home-sections";

export async function saveHomeSections(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const order = form
    .getAll("order")
    .map(String)
    .filter((key, index, all) => key in HOME_SECTION_LABELS && all.indexOf(key) === index);
  if (order.length === 0) return fail("Bölüm listesi okunamadı.");

  const title = (key: string) => optStr(form, `title:${key}`)?.slice(0, 190) ?? null;
  const subtitle = (key: string) => optStr(form, `subtitle:${key}`)?.slice(0, 500) ?? null;

  await db.$transaction(
    order.map((key, index) => {
      const data = { title: title(key), subtitle: subtitle(key), isActive: form.get(`active:${key}`) === "on", sortOrder: index };
      return db.homeSection.upsert({ where: { key }, update: data, create: { key, ...data } });
    }),
  );
  revalidateSite();
  return { ok: true, message: "Ana sayfa düzeni kaydedildi." };
}
