import { notFound } from 'next/navigation';
import { getCoupon } from '@/lib/api/coupons.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { CouponForm } from '@/components/coupons/CouponForm';

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  const coupon = await getCoupon(id, token).catch(() => null);
  if (!coupon) notFound();

  return (
    <div>
      <SectionHeading title={coupon.code} eyebrow="Coupon" />
      <CouponForm mode="edit" initial={coupon} />
    </div>
  );
}
