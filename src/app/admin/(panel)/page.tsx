import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Building2, FolderTree, Images, Package, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonClass } from "@/components/ui/button-styles";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { getSettings, isTrue } from "@/lib/settings";
import { uploadTarget } from "@/lib/uploads";

export const metadata: Metadata = { title: "Dashboard" };

const DEMO_MARKERS = ["000 00 00", "0000000", "Örnek Mah", "@bebbekavm.com"];

export default async function DashboardPage() {
  await requireAdmin();
  const [settings, productCount, activeProducts, categoryCount, brandCount, slideCount, noImageCount, recent] = await Promise.all([
    getSettings(),
    db.product.count(),
    db.product.count({ where: { isActive: true } }),
    db.category.count(),
    db.brand.count(),
    db.heroSlide.count({ where: { isActive: true } }),
    db.product.count({ where: { images: { none: {} } } }),
    db.product.findMany({ orderBy: { updatedAt: "desc" }, take: 6, select: { id: true, name: true, sku: true, updatedAt: true, isActive: true } }),
  ]);

  const warnings: { text: string; href: string }[] = [];
  const looksDemo = (value: string) => DEMO_MARKERS.some((marker) => value.includes(marker));
  if (!settings.whatsappNumber || looksDemo(settings.whatsappNumber)) warnings.push({ text: "WhatsApp numarası girilmemiş veya demo numara kullanılıyor.", href: "/admin/ayarlar/whatsapp" });
  if (looksDemo(settings.phone) || looksDemo(settings.address) || looksDemo(settings.email)) warnings.push({ text: "Telefon, adres veya e-posta alanlarında demo bilgi var.", href: "/admin/ayarlar/iletisim" });
  if (!isTrue(settings.businessInfoVerified)) warnings.push({ text: "İşletme bilgileri doğrulanmadı; LocalBusiness yapısal verisi yayınlanmıyor.", href: "/admin/ayarlar/iletisim" });
  if (!settings.logoUrl) warnings.push({ text: "Logo yüklenmemiş; sitede geçici logo alanı görünüyor.", href: "/admin/ayarlar/site" });
  if (!settings.siteUrl) warnings.push({ text: "Site adresi (canonical URL) ayarlanmamış.", href: "/admin/ayarlar/site" });
  if (noImageCount > 0) warnings.push({ text: `${noImageCount} ürünün görseli yok.`, href: "/admin/urunler" });
  if (process.env.NODE_ENV === "production" && uploadTarget() === "local") warnings.push({ text: "Görseller yerel diske kaydediliyor. Sunucusuz ortamlarda Cloudinary ortam değişkenlerini tanımlayın.", href: "/admin/ayarlar/site" });
  if ((process.env.AUTH_SECRET ?? "").startsWith("dev-only")) warnings.push({ text: "AUTH_SECRET geliştirme değeri; yayına almadan önce güçlü bir gizli anahtar tanımlayın.", href: "/admin" });

  const stats = [
    { label: "Ürün", value: productCount, sub: `${activeProducts} yayında`, href: "/admin/urunler", Icon: Package },
    { label: "Kategori", value: categoryCount, href: "/admin/kategoriler", Icon: FolderTree },
    { label: "Marka", value: brandCount, href: "/admin/markalar", Icon: Building2 },
    { label: "Aktif Hero", value: slideCount, href: "/admin/hero", Icon: Images },
  ];

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Katalog ve içerik durumunu buradan takip edebilirsiniz."
        actions={
          <Link href="/admin/urunler/yeni" className={buttonClass("primary", "md")}>
            <Plus className="size-4" aria-hidden="true" /> Yeni Ürün
          </Link>
        }
      />

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, sub, href, Icon }) => (
          <li key={label}>
            <Link href={href} className="block rounded-3xl border border-line bg-white p-5 transition-shadow hover:shadow-soft">
              <Icon className="size-5 text-ink-muted" aria-hidden="true" />
              <p className="mt-4 font-display text-3xl text-ink">{value}</p>
              <p className="text-sm text-ink-soft">
                {label}
                {sub ? <span className="text-ink-muted"> · {sub}</span> : null}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {warnings.length ? (
        <section className="mt-8 rounded-3xl border border-peach bg-peach-soft/60 p-5 md:p-7">
          <h2 className="flex items-center gap-2 font-semibold text-rose-deep">
            <AlertTriangle className="size-4" aria-hidden="true" /> Yayına almadan önce tamamlanması gerekenler
          </h2>
          <ul className="mt-4 space-y-2">
            {warnings.map((warning) => (
              <li key={warning.text}>
                <Link href={warning.href} className="group flex items-center justify-between gap-4 rounded-xl bg-white/70 px-4 py-3 text-sm text-ink hover:bg-white">
                  {warning.text}
                  <ArrowRight className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8 rounded-3xl border border-line bg-white p-5 md:p-7">
        <h2 className="font-semibold text-ink">Son güncellenen ürünler</h2>
        <ul className="mt-4 divide-y divide-line">
          {recent.map((product) => (
            <li key={product.id}>
              <Link href={`/admin/urunler/${product.id}`} className="flex items-center justify-between gap-4 py-3 text-sm hover:text-ink">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">{product.name}</span>
                  <span className="text-xs text-ink-muted">
                    {product.sku}
                    {product.isActive ? "" : " · Taslak"}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-ink-muted">{formatDate(product.updatedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
