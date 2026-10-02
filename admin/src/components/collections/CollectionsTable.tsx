'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClientFilter } from '@/lib/hooks/useClientFilter';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { RoleGate } from '@/components/common/RoleGate';
import { DeleteButton } from '@/components/common/DeleteButton';
import type { Collection } from '@/lib/types/collection.types';

export function CollectionsTable({
  collections,
  deleteAction,
}: {
  collections: Collection[];
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  const [showInactive, setShowInactive] = useState(false);
  const visible = showInactive ? collections : collections.filter((c) => c.isActive);
  const { query, setQuery, filtered } = useClientFilter(visible, (c) => [c.name, c.slug]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Search collections…" />
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
          title={collections.length === 0 ? 'No collections yet' : 'No matches'}
          description={
            collections.length === 0
              ? undefined
              : visible.length === 0
                ? 'All collections are inactive — check "Show deleted / inactive".'
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
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((collection) => (
                <tr key={collection.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3">{collection.priority}</td>
                  <td className="px-4 py-3 font-medium text-[var(--heading)]">{collection.name}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {collection._count?.collectionProducts ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={collection.isActive ? 'brand' : 'neutral'}>
                      {collection.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/collections/${collection.id}`} className="font-semibold text-[var(--brand)]">
                        Edit
                      </Link>
                      <RoleGate permission="collections.write">
                        <DeleteButton
                          id={collection.id}
                          action={deleteAction}
                          confirmMessage={`Delete "${collection.name}"? It will be deactivated and hidden from this list. You can reactivate it later by editing it.`}
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
