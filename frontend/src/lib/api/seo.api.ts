import { apiFetch } from './api-client';
import type {
  ProductJsonLd,
  SeoMetadata,
  SitemapItem,
} from '@/lib/types/seo.types';

export function getProductSeo(slug: string) {
  return apiFetch<SeoMetadata>(`/public/seo/product/${slug}`, {
    revalidate: 600,
  });
}

export function getCategorySeo(slug: string) {
  return apiFetch<SeoMetadata>(`/public/seo/category/${slug}`, {
    revalidate: 600,
  });
}

export function getCollectionSeo(slug: string) {
  return apiFetch<SeoMetadata>(`/public/seo/collection/${slug}`, {
    revalidate: 600,
  });
}

export function getServiceSeo(slug: string) {
  return apiFetch<SeoMetadata>(`/public/seo/service/${slug}`, {
    revalidate: 600,
  });
}

export function getGuideSeo(slug: string) {
  return apiFetch<SeoMetadata>(`/public/seo/guide/${slug}`, {
    revalidate: 600,
  });
}

export function getProductSchema(slug: string) {
  return apiFetch<ProductJsonLd>(`/public/seo/product-schema/${slug}`, {
    revalidate: 600,
  });
}

export function getSitemapData() {
  return apiFetch<SitemapItem[]>('/public/sitemap-data', {
    revalidate: 3600,
  });
}
