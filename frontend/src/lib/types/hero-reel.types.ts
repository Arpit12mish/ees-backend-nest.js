export type HeroReelProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  image: string | null;
};

export type HeroReel = {
  id: string;
  videoUrl: string;
  posterUrl?: string | null;
  altText?: string | null;
  product: HeroReelProduct | null;
};
