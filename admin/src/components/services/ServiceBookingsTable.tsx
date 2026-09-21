'use client';

import Link from 'next/link';
import { useClientFilter } from '@/lib/hooks/useClientFilter';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import type { ServiceBooking, ServiceBookingStatus } from '@/lib/types/service.types';

const STATUS_TONE: Record<ServiceBookingStatus, 'brand' | 'neutral' | 'danger' | 'warning'> = {
  NEW: 'warning',
  CONTACTED: 'brand',
  CONFIRMED: 'brand',
  COMPLETED: 'neutral',
  CANCELLED: 'danger',
};

export function ServiceBookingsTable({ bookings }: { bookings: ServiceBooking[] }) {
  const { query, setQuery, filtered } = useClientFilter(bookings, (b) => [
    b.name,
    b.email,
    b.service?.name ?? '',
  ]);

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} placeholder="Search name, email, service…" />

      {filtered.length === 0 ? (
        <EmptyState
          title={bookings.length === 0 ? 'No service bookings yet' : 'No matches'}
          description={bookings.length === 0 ? undefined : 'Try a different search term.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => (
                <tr key={booking.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 font-medium text-[var(--heading)]">{booking.name}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{booking.email}</td>
                  <td className="px-4 py-3">{booking.service?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[booking.status]}>{booking.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/service-bookings/${booking.id}`} className="font-semibold text-[var(--brand)]">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
