import type { PrismaClient } from "@prisma/client";
import { normalizeText } from "@/lib/text";

/** Ürünün adı, markası, kategorileri, etiketleri ve özelliklerinden normalize arama metni üretip kaydeder. */
export async function refreshProductSearchText(client: PrismaClient, productId: string): Promise<void> {
  const product = await client.product.findUnique({
    where: { id: productId },
    include: {
      brand: { select: { name: true } },
      categories: { include: { category: { select: { name: true } } } },
      attributeValues: { include: { attributeValue: { select: { value: true } } } },
    },
  });
  if (!product) return;

  const parts = [
    product.name,
    product.sku,
    product.brand?.name,
    product.tags,
    product.material,
    product.ageRange,
    ...product.categories.map((item) => item.category.name),
    ...product.attributeValues.map((item) => item.attributeValue.value),
  ];
  const searchText = normalizeText(parts.filter(Boolean).join(" "));
  await client.product.update({ where: { id: productId }, data: { searchText } });
}
