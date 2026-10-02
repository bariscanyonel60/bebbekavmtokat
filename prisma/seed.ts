import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../src/lib/text";
import { refreshProductSearchText } from "../src/lib/catalog/search-text";
import { SETTING_DEFAULTS } from "../src/lib/settings-defaults";
import { ATTRIBUTES, BANNERS, BRANDS, CATEGORIES, HERO_SLIDES, HOME_SECTIONS, PAGES, PRODUCTS } from "./seed-data";

const db = new PrismaClient();

function assertSafeTarget() {
  const url = process.env.DATABASE_URL ?? "";
  const isLocal = /@(127\.0\.0\.1|localhost)(:\d+)?\//.test(url) || url.startsWith("file:");
  if (!isLocal && process.env.SEED_ALLOW_REMOTE !== "true") {
    throw new Error(
      "Seed, katalog tablolarını sıfırlar. Uzak bir veritabanında çalıştırmak için SEED_ALLOW_REMOTE=true ayarlayın.",
    );
  }
}

async function main() {
  assertSafeTarget();

  await db.$transaction([
    db.productAttributeValue.deleteMany(),
    db.productCategory.deleteMany(),
    db.productImage.deleteMany(),
    db.productVariant.deleteMany(),
    db.product.deleteMany(),
    db.categoryAttribute.deleteMany(),
    db.attributeValue.deleteMany(),
    db.attribute.deleteMany(),
    db.category.updateMany({ data: { parentId: null } }),
    db.category.deleteMany(),
    db.brand.deleteMany(),
    db.heroSlide.deleteMany(),
    db.banner.deleteMany(),
    db.homeSection.deleteMany(),
    db.page.deleteMany(),
  ]);

  // Özellikler
  const attributeIds = new Map<string, string>();
  const valueIds = new Map<string, string>();
  for (const [index, attribute] of ATTRIBUTES.entries()) {
    const created = await db.attribute.create({
      data: { name: attribute.name, slug: attribute.slug, type: attribute.type, sortOrder: index },
    });
    attributeIds.set(attribute.slug, created.id);
    for (const [valueIndex, raw] of attribute.values.entries()) {
      const [value, colorHex] = Array.isArray(raw) ? raw : [raw, null];
      const createdValue = await db.attributeValue.create({
        data: { attributeId: created.id, value, slug: slugify(value), colorHex, sortOrder: valueIndex },
      });
      valueIds.set(`${attribute.slug}:${value}`, createdValue.id);
    }
  }

  // Markalar
  const brandIds = new Map<string, string>();
  for (const [index, brand] of BRANDS.entries()) {
    const created = await db.brand.create({ data: { ...brand, sortOrder: index } });
    brandIds.set(brand.slug, created.id);
  }

  // Kategoriler
  const categoryIds = new Map<string, string>();
  for (const [index, root] of CATEGORIES.entries()) {
    const created = await db.category.create({
      data: {
        name: root.name,
        slug: root.slug,
        tagline: root.tagline,
        description: root.description,
        imageUrl: root.image,
        bannerUrl: root.image,
        isPopular: root.isPopular ?? false,
        popularLabel: root.popularLabel,
        isHomeFeatured: root.isHomeFeatured ?? false,
        homeSortOrder: root.homeSortOrder ?? index,
        sortOrder: index,
      },
    });
    categoryIds.set(root.slug, created.id);
    for (const [attrIndex, attributeSlug] of (root.attributes ?? []).entries()) {
      const attributeId = attributeIds.get(attributeSlug);
      if (attributeId) {
        await db.categoryAttribute.create({ data: { categoryId: created.id, attributeId, sortOrder: attrIndex } });
      }
    }
    for (const [childIndex, child] of root.children.entries()) {
      const createdChild = await db.category.create({
        data: {
          name: child.name,
          slug: child.slug,
          parentId: created.id,
          imageUrl: child.image ?? root.image,
          description: `${child.name} kategorisindeki ürünleri inceleyin. ${root.name} seçkimizde ürün özellikleri ve stok bilgisi için WhatsApp'tan bize ulaşabilirsiniz.`,
          sortOrder: childIndex,
        },
      });
      categoryIds.set(child.slug, createdChild.id);
    }
  }

  // Ürünler
  for (const [index, product] of PRODUCTS.entries()) {
    const primaryCategoryId = categoryIds.get(product.category);
    if (!primaryCategoryId) throw new Error(`Kategori bulunamadı: ${product.category}`);
    const extraIds = (product.extraCategories ?? []).map((slug) => {
      const id = categoryIds.get(slug);
      if (!id) throw new Error(`Kategori bulunamadı: ${slug}`);
      return id;
    });
    const attributeValueIds = Object.entries(product.attributes).flatMap(([attributeSlug, values]) =>
      values.map((value) => {
        const id = valueIds.get(`${attributeSlug}:${value}`);
        if (!id) throw new Error(`Özellik değeri bulunamadı: ${attributeSlug}:${value}`);
        return id;
      }),
    );
    const flags = new Set(product.flags ?? []);
    const createdAt = new Date(Date.now() - index * 36 * 60 * 60 * 1000);

    const created = await db.product.create({
      data: {
        name: product.name,
        slug: slugify(product.name),
        sku: product.sku,
        kind: product.kind ?? "STANDARD",
        brandId: brandIds.get(product.brand),
        primaryCategoryId,
        price: product.price,
        salePrice: product.salePrice,
        showPrice: product.showPrice ?? true,
        stockStatus: product.stock ?? "IN_STOCK",
        isNew: flags.has("isNew"),
        isBestSeller: flags.has("isBestSeller"),
        isFeatured: flags.has("isFeatured"),
        isCampaign: flags.has("isCampaign"),
        shortDescription: product.short,
        description: product.description,
        specs: product.specs?.map(([label, value]) => ({ label, value })),
        dimensions: product.dimensions?.map(([label, value]) => ({ label, value })),
        setItems: product.setItems?.map(([name, dimensions]) => ({ name, dimensions })),
        ageRange: product.ageRange,
        material: product.material,
        tags: product.tags,
        sortOrder: index,
        createdAt,
        images: {
          create: product.images.map((name, imageIndex) => ({
            url: `/images/demo/${name}.jpg`,
            alt: imageIndex === 0 ? product.name : `${product.name} – görsel ${imageIndex + 1}`,
            sortOrder: imageIndex,
            isPrimary: imageIndex === 0,
          })),
        },
        categories: {
          create: [primaryCategoryId, ...extraIds].map((categoryId, catIndex) => ({ categoryId, sortOrder: catIndex })),
        },
        attributeValues: { create: attributeValueIds.map((attributeValueId) => ({ attributeValueId })) },
        variants: product.variants
          ? {
              create: product.variants.map(([name, colorHex], variantIndex) => ({
                name,
                colorHex,
                sortOrder: variantIndex,
              })),
            }
          : undefined,
      },
    });
    await refreshProductSearchText(db, created.id);
  }

  // İçerik
  for (const [index, slide] of HERO_SLIDES.entries()) {
    await db.heroSlide.create({ data: { ...slide, sortOrder: index } });
  }
  for (const [index, banner] of BANNERS.entries()) {
    await db.banner.create({ data: { ...banner, sortOrder: index } });
  }
  for (const [index, section] of HOME_SECTIONS.entries()) {
    await db.homeSection.create({ data: { ...section, sortOrder: index } });
  }
  for (const page of PAGES) {
    await db.page.create({ data: page });
  }

  const seoDefaults = [
    { key: "home", title: SETTING_DEFAULTS.defaultSeoTitle, description: SETTING_DEFAULTS.defaultSeoDescription },
    { key: "products", title: "Bebek ve Çocuk Ürünleri Tokat | Bebbek AVM", description: "Tokat'ta bebek arabası, oto koltuğu, bebek odası, beslenme ve bakım ürünleri. Bebbek AVM ürün kataloğunu inceleyin, WhatsApp'tan bilgi alın." },
    { key: "brands", title: "Bebek ve Çocuk Markaları Tokat | Bebbek AVM", description: "Bebbek AVM Tokat mağazasında yer alan bebek ve çocuk markalarını keşfedin." },
    { key: "campaigns", title: "Kampanyalı Bebek Ürünleri Tokat | Bebbek AVM", description: "Bebbek AVM Tokat mağazasındaki kampanyalı bebek arabası, bebek odası ve çocuk ürünlerini keşfedin." },
    { key: "about", title: "Hakkımızda | Bebbek AVM Tokat", description: "Tokat Esentepe'deki Bebbek AVM'nin hikayesi, mağaza deneyimi ve bebek ürünleri seçimindeki yaklaşımı." },
    { key: "contact", title: "İletişim ve Yol Tarifi | Bebbek AVM Tokat", description: "Bebbek AVM Tokat mağazası: Esentepe Mah., Orhangazi Cd. No:102/A, Tokat Merkez. Telefon, WhatsApp ve yol tarifi bilgileri." },
  ];
  for (const seo of seoDefaults) {
    await db.seoSetting.upsert({ where: { key: seo.key }, create: seo, update: {} });
  }

  // Admin kullanıcı
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const passwordHash = await bcrypt.hash(password, 12);
    await db.user.upsert({
      where: { email },
      create: { email, name: "Yönetici", passwordHash, role: "ADMIN" },
      update: {},
    });
  }

  const counts = {
    kategori: await db.category.count(),
    marka: await db.brand.count(),
    urun: await db.product.count(),
    hero: await db.heroSlide.count(),
    banner: await db.banner.count(),
  };
  console.log("Seed tamamlandı:", counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
