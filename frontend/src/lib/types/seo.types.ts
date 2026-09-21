export type SeoMetadata = {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  robots?: string;
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
  };
  twitter?: {
    title?: string;
    description?: string;
    image?: string;
  };
};

export type SeoMetadataRecord = {
  id: string;
  entityType: 'PRODUCT' | 'CATEGORY' | 'COLLECTION' | 'HOME' | 'SERVICE' | 'GUIDE';
  entityId: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImageUrl?: string | null;
  schemaType?: string | null;
  noindex?: boolean;
};

export type SitemapItem = {
  url: string;
  lastModified: string;
  changeFrequency: string;
  priority: number;
  type: string;
  images?: string[];
};

export type ProductJsonLd = Record<string, unknown>;
