import type { SettingKey } from "@/lib/settings-defaults";

export type SettingFieldKind = "text" | "textarea" | "toggle" | "image" | "url" | "href" | "email" | "phone" | "hours" | "trust" | "select";

export type SettingField = {
  key: SettingKey;
  label: string;
  kind: SettingFieldKind;
  hint?: string;
  placeholder?: string;
  rows?: number;
  options?: { value: string; label: string }[];
};

export type SettingSection = { title: string; description?: string; fields: SettingField[] };

export type SettingGroup = "whatsapp" | "iletisim" | "seo" | "site";

export const SETTING_GROUPS: Record<SettingGroup, { title: string; description: string; sections: SettingSection[] }> = {
  whatsapp: {
    title: "WhatsApp",
    description: "Tüm “Bilgi Al” ve “Sipariş Ver” butonları bu numarayı ve şablonları kullanır.",
    sections: [
      {
        title: "Numara",
        fields: [
          { key: "whatsappNumber", label: "WhatsApp numarası", kind: "phone", placeholder: "+90 5xx xxx xx xx", hint: "Ülke koduyla girin. Boşken WhatsApp butonları gizlenir." },
          { key: "whatsappFloatingActive", label: "Sabit WhatsApp butonunu göster", kind: "toggle" },
        ],
      },
      {
        title: "Mesaj şablonları",
        description: "Kullanılabilir alanlar: {PRODUCT_NAME}, {SKU}, {PRODUCT_URL}",
        fields: [
          { key: "whatsappProductTemplate", label: "Ürün bilgi mesajı", kind: "textarea", rows: 6 },
          { key: "whatsappOrderTemplate", label: "Sipariş mesajı", kind: "textarea", rows: 6 },
          { key: "whatsappGeneralMessage", label: "Genel mesaj", kind: "textarea", rows: 2, hint: "Ürün dışı butonlarda (header, sabit buton, iletişim) kullanılır." },
        ],
      },
    ],
  },
  iletisim: {
    title: "İletişim",
    description: "Footer, iletişim sayfası ve yapılandırılmış veride (schema.org) kullanılan mağaza bilgileri.",
    sections: [
      {
        title: "Mağaza bilgileri",
        fields: [
          { key: "phone", label: "Telefon", kind: "phone" },
          { key: "email", label: "E-posta", kind: "email" },
          { key: "address", label: "Adres", kind: "textarea", rows: 2 },
          { key: "district", label: "İlçe", kind: "text", placeholder: "Tokat Merkez" },
          { key: "city", label: "Şehir", kind: "text", placeholder: "Tokat" },
          { key: "cityLocative", label: "Şehir (…'ta / …'da)", kind: "text", placeholder: "Tokat'ta", hint: "Sayfa başlıklarında ve yerel SEO metinlerinde kullanılır." },
          { key: "postalCode", label: "Posta kodu", kind: "text", placeholder: "60100" },
          { key: "workingHours", label: "Çalışma saatleri", kind: "hours", rows: 3, hint: "Her satıra “Gün: Saat” yazın. Örn. Pazar: 11:00 – 20:00" },
          {
            key: "businessInfoVerified",
            label: "Bilgiler gerçek ve doğrulandı",
            kind: "toggle",
            hint: "Açıldığında adres ve telefon, Google için LocalBusiness yapılandırılmış verisi olarak yayınlanır.",
          },
        ],
      },
      {
        title: "Harita",
        fields: [
          { key: "mapsEmbedUrl", label: "Google Maps embed linki", kind: "url", hint: "Google Maps › Paylaş › Haritayı yerleştir içindeki src adresi (https://www.google.com/maps/embed?...)." },
          { key: "mapsLink", label: "Yol tarifi linki", kind: "url" },
        ],
      },
      {
        title: "Sosyal medya",
        fields: [
          { key: "instagramUrl", label: "Instagram", kind: "url" },
          { key: "instagramHandle", label: "Instagram kullanıcı adı", kind: "text", placeholder: "@bebbekavm" },
          { key: "facebookUrl", label: "Facebook", kind: "url" },
          { key: "youtubeUrl", label: "YouTube", kind: "url" },
          { key: "tiktokUrl", label: "TikTok", kind: "url" },
        ],
      },
    ],
  },
  seo: {
    title: "SEO",
    description: "Varsayılan başlık ve açıklama; sayfa bazlı ayarlar aşağıdadır.",
    sections: [
      {
        title: "Varsayılanlar",
        fields: [
          { key: "defaultSeoTitle", label: "Varsayılan başlık", kind: "text" },
          { key: "defaultSeoDescription", label: "Varsayılan açıklama", kind: "textarea", rows: 3, hint: "150–160 karakter idealdir." },
          { key: "defaultOgImageUrl", label: "Varsayılan paylaşım görseli", kind: "image", hint: "1200×630 px önerilir." },
          {
            key: "googleSiteVerification",
            label: "Google Search Console doğrulama kodu",
            kind: "text",
            hint: "Search Console › HTML etiketi yönteminde verilen meta etiketinin yalnızca content değeri.",
          },
          {
            key: "organizationType",
            label: "İşletme türü (schema.org)",
            kind: "select",
            options: [
              { value: "Store", label: "Mağaza (Store)" },
              { value: "ChildrensStore", label: "Çocuk Mağazası (ChildrensStore)" },
              { value: "FurnitureStore", label: "Mobilya Mağazası (FurnitureStore)" },
            ],
          },
        ],
      },
    ],
  },
  site: {
    title: "Site Ayarları",
    description: "Marka, duyuru çubuğu, menü, footer ve kurumsal metinler.",
    sections: [
      {
        title: "Marka",
        fields: [
          { key: "siteName", label: "Site adı", kind: "text" },
          { key: "siteTagline", label: "Slogan", kind: "text" },
          { key: "siteUrl", label: "Site adresi", kind: "url", placeholder: "https://www.bebbekavm.com", hint: "Canonical, sitemap ve WhatsApp ürün linklerinde kullanılır." },
          { key: "logoUrl", label: "Logo", kind: "image", hint: "Boşsa yazı logo gösterilir." },
        ],
      },
      {
        title: "Duyuru çubuğu",
        fields: [
          { key: "announcementActive", label: "Duyuru çubuğunu göster", kind: "toggle" },
          { key: "announcementText", label: "Duyuru metni", kind: "text" },
          { key: "announcementHref", label: "Duyuru linki", kind: "href" },
        ],
      },
      {
        title: "Menü & arama",
        fields: [
          { key: "headerNavLinks", label: "Üst menü linkleri", kind: "textarea", rows: 6, hint: "Her satır: Etiket|/link" },
          { key: "popularSearches", label: "Popüler aramalar", kind: "text", hint: "Virgülle ayırın." },
        ],
      },
      {
        title: "Footer & ürün sayfası",
        fields: [
          { key: "footerDescription", label: "Footer açıklaması", kind: "textarea", rows: 3 },
          { key: "deliveryInfo", label: "Varsayılan teslimat bilgisi", kind: "textarea", rows: 3 },
          { key: "warrantyInfo", label: "Varsayılan garanti bilgisi", kind: "textarea", rows: 3 },
          {
            key: "trustItems",
            label: "Güven alanı maddeleri",
            kind: "trust",
            rows: 5,
            hint: "Her satır: ikon | başlık | açıklama. İkonlar: badge-check, messages-square, store, truck, heart, whatsapp. Kanıtlanamayan iddialar yazmayın.",
          },
        ],
      },
      {
        title: "Hakkımızda",
        fields: [
          { key: "aboutHeadline", label: "Başlık", kind: "text" },
          { key: "aboutStory", label: "Hikâyemiz", kind: "textarea", rows: 4 },
          { key: "aboutStore", label: "Mağazamız", kind: "textarea", rows: 4 },
          { key: "aboutApproach", label: "Ürün seçim yaklaşımımız", kind: "textarea", rows: 4 },
          { key: "aboutService", label: "Müşteri hizmeti", kind: "textarea", rows: 4 },
        ],
      },
    ],
  },
};

export const SEO_PAGE_KEYS = [
  { key: "home", label: "Ana sayfa", path: "/" },
  { key: "products", label: "Tüm ürünler", path: "/urunler" },
  { key: "campaigns", label: "Kampanyalar", path: "/kampanyalar" },
  { key: "brands", label: "Markalar", path: "/markalar" },
  { key: "about", label: "Hakkımızda", path: "/hakkimizda" },
  { key: "contact", label: "İletişim", path: "/iletisim" },
] as const;

export function hoursToText(json: string): string {
  try {
    const rows = JSON.parse(json) as { label: string; value: string }[];
    return rows.map((row) => `${row.label}: ${row.value}`).join("\n");
  } catch {
    return "";
  }
}

export function trustToText(json: string): string {
  try {
    const rows = JSON.parse(json) as { icon: string; title: string; description: string }[];
    return rows.map((row) => `${row.icon} | ${row.title} | ${row.description}`).join("\n");
  } catch {
    return "";
  }
}
