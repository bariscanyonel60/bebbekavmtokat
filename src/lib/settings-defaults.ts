export type TrustItem = { icon: string; title: string; description: string };
export type WorkingHour = { label: string; value: string };

export const SETTING_DEFAULTS = {
  siteName: "Bebbek AVM",
  siteTagline: "Tokat Bebek & Çocuk Mağazası",
  siteUrl: "",
  logoUrl: "/brand/bebbek-avm-logo.png",
  announcementActive: "true",
  announcementText: "Mağazamızdaki ürünler hakkında WhatsApp'tan bilgi alın.",
  announcementHref: "",
  /** Her satır: "Etiket|/link" */
  headerNavLinks:
    "Bebek Arabaları|/kategori/bebek-arabalari\nBebek Odası|/kategori/bebek-odalari\nAnne & Bebek|/kategori/anne-bebek-bakim\nKampanyalar|/kampanyalar\nMarkalar|/markalar\nHakkımızda|/hakkimizda",
  popularSearches: "Travel sistem, Beşik, Oto koltuğu, Mama sandalyesi, Ana kucağı",

  whatsappNumber: "+90 533 313 12 96",
  whatsappGreeting: "Merhaba Bebbek AVM,",
  whatsappProductTemplate:
    "Merhaba Bebbek AVM,\n\n{PRODUCT_NAME} ürünü hakkında bilgi almak istiyorum.\n\nÜrün Kodu: {SKU}\nÜrün: {PRODUCT_URL}",
  whatsappOrderTemplate:
    "Merhaba Bebbek AVM,\n\n{PRODUCT_NAME} ürününü sipariş etmek istiyorum.\n\nÜrün Kodu: {SKU}\nÜrün: {PRODUCT_URL}",
  whatsappGeneralMessage: "Merhaba Bebbek AVM, ürünleriniz hakkında bilgi almak istiyorum.",
  whatsappFloatingActive: "true",

  phone: "0533 313 12 96",
  email: "",
  address: "Esentepe Mah., Orhangazi Cd. No:102/A",
  district: "Tokat Merkez",
  city: "Tokat",
  /** Başlık ve metinlerde kullanılan bulunma hâli: "Tokat'ta". */
  cityLocative: "Tokat'ta",
  postalCode: "60100",
  mapsEmbedUrl: "https://www.google.com/maps?q=BEBEK+AVM,+Orhangazi+Cd.+No:102/A,+Esentepe,+60100+Tokat+Merkez/Tokat&output=embed",
  mapsLink: "https://www.google.com/maps/search/?api=1&query=BEBEK+AVM+Orhangazi+Cd.+No:102%2FA+Esentepe+60100+Tokat+Merkez%2FTokat",
  workingHours: JSON.stringify([] satisfies WorkingHour[]),

  instagramUrl: "",
  facebookUrl: "",
  youtubeUrl: "",
  tiktokUrl: "",
  instagramHandle: "",

  footerDescription:
    "Bebeğinizin ilk günlerinden çocukluk yıllarına kadar ihtiyaç duyduğunuz seçkin ürünleri mağazamızda ve dijital vitrinimizde bir araya getiriyoruz.",
  deliveryInfo:
    "Ürünlerimizi mağazamızdan teslim alabilir veya teslimat seçenekleri için WhatsApp üzerinden bizimle iletişime geçebilirsiniz.",
  warrantyInfo:
    "Ürünler, üretici/distribütör garanti koşullarına tabidir. Garanti süresi ve kapsamı için ürün belgelerini inceleyebilir veya bize danışabilirsiniz.",
  trustItems: JSON.stringify([
    { icon: "badge-check", title: "Güvenilir Markalar", description: "Seçkin ve bilinen markaların ürünleri" },
    { icon: "messages-square", title: "Uzman Ürün Desteği", description: "Doğru ürünü birlikte seçelim" },
    { icon: "whatsapp", title: "WhatsApp'tan Hızlı İletişim", description: "Sorularınıza hızlı yanıt" },
    { icon: "store", title: "Mağazadan Teslim & Bilgi", description: "Ürünleri mağazamızda yakından inceleyin" },
  ] satisfies TrustItem[]),

  aboutHeadline: "Ailelerin ilk adımlarına eşlik eden bir mağaza",
  aboutStory:
    "Bebbek AVM, bebek ve çocuk ürünlerini seçerken ailelerin güvenle danışabileceği, ürünleri yakından görüp deneyebileceği bir mağaza olarak kuruldu. Her ürünü vitrine koymadan önce kullanım kolaylığını, güvenliğini ve uzun ömürlülüğünü değerlendiriyoruz.",
  aboutStore:
    "Mağazamızda bebek arabalarından oto koltuklarına, bebek odası mobilyalarından beslenme ürünlerine kadar geniş bir seçkiyi bir arada sunuyoruz. Ürünleri kurulu halde görebilir, ekibimizden birebir bilgi alabilirsiniz.",
  aboutApproach:
    "Çok sayıda ürün yerine doğru ürünü öneriyoruz. Kullanım alışkanlıklarınızı, yaşam alanınızı ve bütçenizi dinleyip ihtiyacınıza en uygun seçenekleri birlikte değerlendiriyoruz.",
  aboutService:
    "Ürün seçimi, karşılaştırma ve kullanım konularında mağazada ve WhatsApp üzerinden destek veriyoruz. Siparişlerinizi ve teslimat detaylarını birebir iletişimle planlıyoruz.",

  defaultSeoTitle: "Bebbek AVM | Tokat Bebek Mağazası – Bebek Arabası, Bebek Odası",
  defaultSeoDescription:
    "Tokat'ta bebek arabası, oto koltuğu, beşik ve bebek odası mobilyaları Bebbek AVM'de. Esentepe Orhangazi Cd. mağazamızı ziyaret edin, WhatsApp'tan bilgi alın.",
  defaultOgImageUrl: "/brand/og-default.jpg",
  /** Google Search Console › HTML etiketi doğrulamasındaki content değeri. */
  googleSiteVerification: "",
  organizationType: "FurnitureStore",
  /** Açılmadan LocalBusiness şeması yayınlanmaz. */
  businessInfoVerified: "true",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type SiteSettings = Record<SettingKey, string>;
