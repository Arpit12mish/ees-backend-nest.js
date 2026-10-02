'use client';

import Link from 'next/link';
import { useClientFilter } from '@/lib/hooks/useClientFilter';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { RoleGate } from '@/components/common/RoleGate';
import { DeleteButton } from '@/components/common/DeleteButton';
import type { SeoMetadataRecord } from '@/lib/types/seo.types';

export function SeoRecordsTable({
  records,
  deleteAction,
}: {
  records: SeoMetadataRecord[];
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  const { query, setQuery, filtered } = useClientFilter(records, (r) => [
    r.entityType,
    r.entityId,
    r.seoTitle ?? '',
  ]);

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} placeholder="Search entity type, id, title…" />

      {filtered.length === 0 ? (
        <EmptyState
          title={records.length === 0 ? 'No SEO records yet' : 'No matches'}
          description={records.length === 0 ? undefined : 'Try a different search term.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                <th className="px-4 py-3">Entity type</th>
                <th className="px-4 py-3">Entity ID</th>
                <th className="px-4 py-3">SEO title</th>
                <th className="px-4 py-3">Robots</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => (
                <tr key={record.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 font-medium text-[var(--heading)]">{record.entityType}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">{record.entityId}</td>
                  <td className="px-4 py-3">{record.seoTitle ?? '—'}</td>
                  <td className="px-4 py-3">
                    {record.noindex ? (
                      <span className="font-semibold text-[var(--danger)]">noindex</span>
                    ) : (
                      <span className="text-[var(--muted)]">index</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {new Date(record.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/seo/${record.id}`} className="font-semibold text-[var(--brand)]">
                        Edit
                      </Link>
                      <RoleGate permission="seo.delete">
                        <DeleteButton
                          id={record.id}
                          action={deleteAction}
                          confirmMessage="Delete this SEO record? This permanently removes it and cannot be undone — the page will fall back to its default metadata."
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
