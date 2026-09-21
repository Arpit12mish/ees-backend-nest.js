import { notFound } from 'next/navigation';
import { getServiceBooking } from '@/lib/api/services.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ServiceBookingStatusControl } from '@/components/services/ServiceBookingStatusControl';

export default async function ServiceBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  const booking = await getServiceBooking(id, token).catch(() => null);
  if (!booking) notFound();

  return (
    <div className="space-y-6">
      <SectionHeading title={booking.name} eyebrow="Service booking" />

      <div className="max-w-xl space-y-3 rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
        <p className="text-sm"><span className="font-semibold text-[var(--heading)]">Email:</span> {booking.email}</p>
        {booking.phone ? <p className="text-sm"><span className="font-semibold text-[var(--heading)]">Phone:</span> {booking.phone}</p> : null}
        <p className="text-sm"><span className="font-semibold text-[var(--heading)]">Service:</span> {booking.service?.name ?? '—'}</p>
        <p className="text-sm text-[var(--muted)]">
          Received {new Date(booking.createdAt).toLocaleString()}
        </p>
        {booking.message ? (
          <div>
            <p className="text-sm font-semibold text-[var(--heading)]">Message</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--muted)]">{booking.message}</p>
          </div>
        ) : null}
      </div>

      <div className="max-w-xl rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
        <h3 className="font-semibold text-[var(--heading)]">Status</h3>
        <div className="mt-3">
          <ServiceBookingStatusControl booking={booking} />
        </div>
      </div>
    </div>
  );
}
