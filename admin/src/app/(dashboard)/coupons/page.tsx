import Link from 'next/link';
import { getCoupons } from '@/lib/api/coupons.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { RoleGate } from '@/components/common/RoleGate';
import { CouponsTable } from '@/components/coupons/CouponsTable';
import { deleteCouponAction } from './actions';

export default async function CouponsPage() {
  const token = await getServerToken();
  const coupons = await getCoupons(token);

  return (
    <div>
      <SectionHeading
        title="Coupons"
        description={`${coupons.length} coupons`}
        action={
          <RoleGate permission="coupons.write">
            <Link
              href="/coupons/new"
              className="min-h-11 inline-flex items-center rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
            >
              New coupon
            </Link>
          </RoleGate>
        }
      />
      <CouponsTable coupons={coupons} deleteAction={deleteCouponAction} />
    </div>
  );
}
