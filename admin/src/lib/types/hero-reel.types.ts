export type HeroReelProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images?: { cardUrl?: string | null; imageUrl?: string | null }[];
};

export type HeroReel = {
  id: string;
  videoUrl: string;
  posterUrl?: string | null;
  altText?: string | null;
  productId?: string | null;
  product?: HeroReelProduct | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HeroReelInput = {
  videoUrl: string;
  posterUrl?: string;
  altText?: string;
  productId?: string;
  priority?: number;
  isActive?: boolean;
};
