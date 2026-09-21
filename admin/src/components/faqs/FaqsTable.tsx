'use client';

import Link from 'next/link';
import { useClientFilter } from '@/lib/hooks/useClientFilter';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { RoleGate } from '@/components/common/RoleGate';
import type { Faq } from '@/lib/types/faq.types';

export function FaqsTable({
  faqs,
  deleteAction,
}: {
  faqs: Faq[];
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  const { query, setQuery, filtered } = useClientFilter(faqs, (f) => [
    f.question,
    f.entityType,
    f.entityId ?? '',
  ]);

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} placeholder="Search FAQs…" />

      {filtered.length === 0 ? (
        <EmptyState
          title={faqs.length === 0 ? 'No FAQs yet' : 'No matches'}
          description={faqs.length === 0 ? undefined : 'Try a different search term.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                <th className="px-4 py-3">Applies to</th>
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((faq) => (
                <tr key={faq.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 font-medium text-[var(--heading)]">
                    {faq.entityType}
                    {faq.entityId ? (
                      <div className="text-xs font-normal text-[var(--muted)]">{faq.entityId}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{faq.question}</td>
                  <td className="px-4 py-3">
                    <Badge tone={faq.isActive ? 'brand' : 'neutral'}>
                      {faq.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/faqs/${faq.id}`} className="font-semibold text-[var(--brand)]">
                        Edit
                      </Link>
                      <RoleGate permission="faqs.delete">
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={faq.id} />
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
