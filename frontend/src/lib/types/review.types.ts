export type Review = {
  id: string;
  customerName: string;
  rating: number;
  title?: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
};

export type CreateReviewInput = {
  customerName: string;
  customerEmail: string;
  rating: number;
  title?: string;
  comment: string;
};
