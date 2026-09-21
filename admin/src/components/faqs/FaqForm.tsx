'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFaq, updateFaq } from '@/lib/api/faqs.api';
import { getClientToken } from '@/lib/auth/token-cookie';
import { ErrorState } from '@/components/common/ErrorState';
import type { Faq, FaqEntityType, FaqInput } from '@/lib/types/faq.types';

export function FaqForm({ mode, initial }: { mode: 'create' | 'edit'; initial?: Faq }) {
  const router = useRouter();
  const [form, setForm] = useState<FaqInput>({
    entityType: initial?.entityType ?? 'GLOBAL',
    entityId: initial?.entityId ?? '',
    question: initial?.question ?? '',
    answer: initial?.answer ?? '',
    sortOrder: initial?.sortOrder ?? 0,
    isActive: initial?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const input: FaqInput = {
      ...form,
      entityId: form.entityType === 'GLOBAL' ? undefined : form.entityId,
    };
    try {
      if (mode === 'create') {
        const created = await createFaq(input, getClientToken());
        router.push(`/faqs/${created.id}`);
      } else if (initial) {
        await updateFaq(initial.id, input, getClientToken());
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save FAQ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">Applies to</label>
        <select
          value={form.entityType}
          onChange={(e) => {
            const next = e.target.value as FaqEntityType;
            setForm({ ...form, entityType: next, entityId: next === 'GLOBAL' ? '' : form.entityId });
          }}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        >
          <option value="GLOBAL">Global (e.g. /faq page)</option>
          <option value="PRODUCT">Product</option>
          <option value="CATEGORY">Category</option>
          <option value="GUIDE">Guide</option>
        </select>
      </div>
      {form.entityType !== 'GLOBAL' ? (
        <div>
          <label className="block text-sm font-medium text-[var(--heading)]">
            Entity ID <span className="font-normal text-[var(--muted)]">(paste the product/category/guide ID)</span>
          </label>
          <input
            required
            value={form.entityId}
            onChange={(e) => setForm({ ...form, entityId: e.target.value })}
            className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
          />
        </div>
      ) : null}
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">Question</label>
        <input
          required
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">Answer</label>
        <textarea
          required
          rows={4}
          value={form.answer}
          onChange={(e) => setForm({ ...form, answer: e.target.value })}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--heading)]">Sort order</label>
          <input
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            className="mt-1 w-28 rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--heading)]">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
        </div>
      </div>

      {error ? <ErrorState title="Could not save" description={error} /> : null}

      <button
        type="submit"
        disabled={saving}
        className="min-h-11 rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? 'Saving…' : mode === 'create' ? 'Create FAQ' : 'Save changes'}
      </button>
    </form>
  );
}
