export type Review = {
  id: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title?: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  product?: { id: string; name: string; slug: string };
};
