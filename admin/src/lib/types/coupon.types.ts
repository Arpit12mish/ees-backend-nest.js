export type CouponType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';

export type Coupon = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CouponInput = {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  isActive?: boolean;
};
