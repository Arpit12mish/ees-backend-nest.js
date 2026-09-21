import { SectionHeading } from '@/components/common/SectionHeading';
import { CouponForm } from '@/components/coupons/CouponForm';

export default function NewCouponPage() {
  return (
    <div>
      <SectionHeading title="New coupon" />
      <CouponForm mode="create" />
    </div>
  );
}
