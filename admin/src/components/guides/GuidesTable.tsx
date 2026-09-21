'use client';

import Link from 'next/link';
import { useClientFilter } from '@/lib/hooks/useClientFilter';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { RoleGate } from '@/components/common/RoleGate';
import type { Guide } from '@/lib/types/guide.types';

export function GuidesTable({
  guides,
  deleteAction,
}: {
  guides: Guide[];
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  const { query, setQuery, filtered } = useClientFilter(guides, (g) => [
    g.title,
    g.slug,
    ...g.tags,
  ]);

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} placeholder="Search guides…" />

      {filtered.length === 0 ? (
        <EmptyState
          title={guides.length === 0 ? 'No guides yet' : 'No matches'}
          description={guides.length === 0 ? undefined : 'Try a different search term.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((guide) => (
                <tr key={guide.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 font-medium text-[var(--heading)]">{guide.title}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">{guide.tags.join(', ') || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge tone={guide.status === 'PUBLISHED' ? 'brand' : 'neutral'}>
                      {guide.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {new Date(guide.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/guides/${guide.id}`} className="font-semibold text-[var(--brand)]">
                        Edit
                      </Link>
                      <RoleGate permission="guides.delete">
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={guide.id} />
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
