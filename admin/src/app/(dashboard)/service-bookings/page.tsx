import { getServiceBookings } from '@/lib/api/services.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ServiceBookingsTable } from '@/components/services/ServiceBookingsTable';

export default async function ServiceBookingsPage() {
  const token = await getServerToken();
  const bookings = await getServiceBookings(token);

  return (
    <div>
      <SectionHeading title="Service bookings" description={`${bookings.length} bookings`} />
      <ServiceBookingsTable bookings={bookings} />
    </div>
  );
}
