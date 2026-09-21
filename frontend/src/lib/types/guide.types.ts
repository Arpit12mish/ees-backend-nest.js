export type GuideCard = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  tags: string[];
  publishedAt?: string | null;
};

export type GuideDetail = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  bodyHtml: string;
  coverImageUrl?: string | null;
  tags: string[];
  publishedAt?: string | null;
  updatedAt?: string | null;
};
