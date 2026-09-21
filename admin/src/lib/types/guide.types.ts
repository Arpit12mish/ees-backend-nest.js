export type GuideStatus = 'DRAFT' | 'PUBLISHED' | 'INACTIVE';

export type Guide = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  bodyHtml: string;
  coverImageUrl?: string | null;
  tags: string[];
  status: GuideStatus;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GuideInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  bodyHtml: string;
  coverImageUrl?: string;
  tags?: string[];
  status?: GuideStatus;
};
