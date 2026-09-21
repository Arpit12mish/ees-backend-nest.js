export type SeoEntityType =
  | 'PRODUCT'
  | 'CATEGORY'
  | 'COLLECTION'
  | 'HOME'
  | 'SERVICE'
  | 'GUIDE';

export type SeoMetadataRecord = {
  id: string;
  entityType: SeoEntityType;
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
  createdAt: string;
  updatedAt: string;
};

export type SeoInput = {
  entityType: SeoEntityType;
  entityId?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImageUrl?: string;
  schemaType?: string;
  noindex?: boolean;
};
