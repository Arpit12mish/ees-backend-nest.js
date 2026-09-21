'use client';

import { useState } from 'react';
import { SeoEditor } from './SeoEditor';
import type { SeoEntityType } from '@/lib/types/seo.types';

export function NewSeoForm() {
  const [entityType, setEntityType] = useState<SeoEntityType>('HOME');
  const [entityId, setEntityId] = useState('HOME');
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return <SeoEditor entityType={entityType} entityId={entityId} initialData={null} />;
  }

  return (
    <div className="max-w-xl space-y-4 rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">Entity type</label>
        <select
          value={entityType}
          onChange={(e) => {
            const next = e.target.value as SeoEntityType;
            setEntityType(next);
            setEntityId(next === 'HOME' ? 'HOME' : '');
          }}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        >
          <option value="HOME">Home</option>
          <option value="PRODUCT">Product</option>
          <option value="CATEGORY">Category</option>
          <option value="COLLECTION">Collection</option>
          <option value="SERVICE">Service</option>
          <option value="GUIDE">Guide</option>
        </select>
      </div>
      {entityType !== 'HOME' ? (
        <div>
          <label className="block text-sm font-medium text-[var(--heading)]">
            Entity ID <span className="font-normal text-[var(--muted)]">(paste the product/category/collection ID)</span>
          </label>
          <input
            required
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
          />
        </div>
      ) : null}
      <button
        type="button"
        disabled={!entityId.trim()}
        onClick={() => setConfirmed(true)}
        className="min-h-11 rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Continue
      </button>
    </div>
  );
}
