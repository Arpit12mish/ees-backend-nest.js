'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useClientFilter } from '@/lib/hooks/useClientFilter';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import type {
  ContactLead,
  ContactLeadSource,
  ContactLeadStatus,
} from '@/lib/types/contactLead.types';

const STATUS_TONE: Record<ContactLeadStatus, 'brand' | 'neutral' | 'danger' | 'warning'> = {
  NEW: 'warning',
  CONTACTED: 'brand',
  CLOSED: 'neutral',
  SPAM: 'danger',
};

const SOURCE_TONE: Record<ContactLeadSource, 'brand' | 'neutral'> = {
  CUSTOM_BRACELET: 'brand',
  GENERAL: 'neutral',
};

const SOURCE_LABEL: Record<ContactLeadSource, string> = {
  CUSTOM_BRACELET: 'Custom Bracelet',
  GENERAL: 'General',
};

const SOURCE_FILTERS: { value: ContactLeadSource | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'GENERAL', label: 'General' },
  { value: 'CUSTOM_BRACELET', label: 'Custom Bracelet' },
];

export function ContactLeadsTable({ leads }: { leads: ContactLead[] }) {
  const [sourceFilter, setSourceFilter] = useState<ContactLeadSource | 'ALL'>('ALL');

  const bySource = useMemo(
    () => (sourceFilter === 'ALL' ? leads : leads.filter((l) => l.source === sourceFilter)),
    [leads, sourceFilter],
  );

  const { query, setQuery, filtered } = useClientFilter(bySource, (l) => [
    l.name,
    l.email,
    l.subject ?? '',
    l.location ?? '',
  ]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {SOURCE_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setSourceFilter(f.value)}
            className={`min-h-9 rounded-md border px-3 text-sm font-semibold ${
              sourceFilter === f.value
                ? 'border-[var(--brand)] bg-[var(--brand)] text-white'
                : 'border-[var(--border)] text-[var(--heading)] hover:border-[var(--brand)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search name, email, subject, location…"
      />

      {filtered.length === 0 ? (
        <EmptyState
          title={leads.length === 0 ? 'No contact leads yet' : 'No matches'}
          description={leads.length === 0 ? undefined : 'Try a different search term.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 font-medium text-[var(--heading)]">{lead.name}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{lead.email}</td>
                  <td className="px-4 py-3">{lead.subject ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge tone={SOURCE_TONE[lead.source]}>{SOURCE_LABEL[lead.source]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[lead.status]}>{lead.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/contact-leads/${lead.id}`} className="font-semibold text-[var(--brand)]">
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
