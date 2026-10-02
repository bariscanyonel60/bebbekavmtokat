export type MenuCategory = {
  name: string;
  slug: string;
  tagline: string | null;
  imageUrl: string | null;
  children: { name: string; slug: string; children: { name: string; slug: string }[] }[];
};

export type MenuBanner = {
  eyebrow: string | null;
  title: string;
  href: string | null;
  ctaLabel: string | null;
  imageUrl: string;
  imageAlt: string | null;
} | null;
