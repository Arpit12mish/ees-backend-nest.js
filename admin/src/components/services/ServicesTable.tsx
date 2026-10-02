'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClientFilter } from '@/lib/hooks/useClientFilter';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { RoleGate } from '@/components/common/RoleGate';
import { DeleteButton } from '@/components/common/DeleteButton';
import type { Service } from '@/lib/types/service.types';

export function ServicesTable({
  services,
  deleteAction,
}: {
  services: Service[];
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  const [showInactive, setShowInactive] = useState(false);
  const visible = showInactive ? services : services.filter((s) => s.isActive);
  const { query, setQuery, filtered } = useClientFilter(visible, (s) => [s.name, s.slug]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Search services…" />
        <label className="flex items-center gap-2 text-sm text-[var(--heading)]">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Show deleted / inactive
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={services.length === 0 ? 'No services yet' : 'No matches'}
          description={
            services.length === 0
              ? undefined
              : visible.length === 0
                ? 'All services are inactive — check "Show deleted / inactive".'
                : 'Try a different search term.'
          }
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
                        <DeleteButton
                          id={service.id}
                          action={deleteAction}
                          confirmMessage={`Delete "${service.name}"? It will be deactivated and hidden from the storefront and this list.`}
                        />
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
