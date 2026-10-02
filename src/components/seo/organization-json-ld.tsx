import { phoneE164 } from "@/lib/local-seo";
import { absoluteUrl, organizationId, serializeJsonLd, storeId } from "@/lib/seo";
import { getSettings, getSiteUrl, isTrue } from "@/lib/settings";

/**
 * Organization ve WebSite her zaman yayınlanır. LocalBusiness (Store) yalnızca admin gerçek adres/telefon
 * bilgilerini doğruladığında eklenir; demo bilgilerle yerel işletme şeması üretilmez.
 */
export async function OrganizationJsonLd() {
  const [settings, siteUrl] = await Promise.all([getSettings(), getSiteUrl()]);
  const sameAs = [settings.instagramUrl, settings.facebookUrl, settings.youtubeUrl, settings.tiktokUrl].filter(
    (url) => url && url !== "https://www.instagram.com/",
  );
  const logo = settings.logoUrl ? absoluteUrl(siteUrl, settings.logoUrl) : undefined;
  const telephone = phoneE164(settings.phone);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId(siteUrl),
    name: settings.siteName,
    url: siteUrl,
    ...(logo ? { logo } : {}),
    ...(telephone ? { telephone } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    url: siteUrl,
    inLanguage: "tr-TR",
    publisher: { "@id": organizationId(siteUrl) },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/urunler?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  const verified = isTrue(settings.businessInfoVerified) && settings.address && settings.phone;
  const store = verified
    ? {
        "@context": "https://schema.org",
        "@type": settings.organizationType || "Store",
        "@id": storeId(siteUrl),
        name: settings.siteName,
        description: settings.defaultSeoDescription,
        url: siteUrl,
        telephone: telephone ?? settings.phone,
        ...(settings.email ? { email: settings.email } : {}),
        image: absoluteUrl(siteUrl, settings.defaultOgImageUrl),
        ...(logo ? { logo } : {}),
        parentOrganization: { "@id": organizationId(siteUrl) },
        address: {
          "@type": "PostalAddress",
          streetAddress: settings.address,
          addressLocality: settings.district || settings.city || undefined,
          addressRegion: settings.city || undefined,
          postalCode: settings.postalCode || undefined,
          addressCountry: "TR",
        },
        ...(settings.city ? { areaServed: { "@type": "City", name: settings.city } } : {}),
        ...(settings.mapsLink ? { hasMap: settings.mapsLink } : {}),
        ...(sameAs.length ? { sameAs } : {}),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(website) }} />
      {store ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(store) }} /> : null}
    </>
  );
}
