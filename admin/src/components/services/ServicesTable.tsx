'use client';

import Link from 'next/link';
import { useClientFilter } from '@/lib/hooks/useClientFilter';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { RoleGate } from '@/components/common/RoleGate';
import type { Service } from '@/lib/types/service.types';

export function ServicesTable({
  services,
  deleteAction,
}: {
  services: Service[];
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  const { query, setQuery, filtered } = useClientFilter(services, (s) => [s.name, s.slug]);

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} placeholder="Search services…" />

      {filtered.length === 0 ? (
        <EmptyState
          title={services.length === 0 ? 'No services yet' : 'No matches'}
          description={services.length === 0 ? undefined : 'Try a different search term.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((service) => (
                <tr key={service.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3">{service.priority}</td>
                  <td className="px-4 py-3 font-medium text-[var(--heading)]">{service.name}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{service.priceLabel ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge tone={service.isActive ? 'brand' : 'neutral'}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {new Date(service.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/services/${service.id}`} className="font-semibold text-[var(--brand)]">
                        Edit
                      </Link>
                      <RoleGate permission="services.write">
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={service.id} />
                          <button type="submit" className="font-semibold text-[var(--danger)]">
                            Delete
                          </button>
                        </form>
                      </RoleGate>
                    </div>
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
