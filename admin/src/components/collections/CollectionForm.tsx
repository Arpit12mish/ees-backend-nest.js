'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCollection, updateCollection } from '@/lib/api/collections.api';
import { getClientToken } from '@/lib/auth/token-cookie';
import { ErrorState } from '@/components/common/ErrorState';
import { ImageUploadField } from '@/components/common/ImageUploadField';
import type { Collection, CollectionInput } from '@/lib/types/collection.types';

export function CollectionForm({
  mode,
  initial,
}: {
  mode: 'create' | 'edit';
  initial?: Collection;
}) {
  const router = useRouter();
  const [form, setForm] = useState<CollectionInput>({
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    description: initial?.description ?? '',
    imageUrl: initial?.imageUrl ?? '',
    priority: initial?.priority ?? 0,
    isActive: initial?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const input: CollectionInput = {
      ...form,
      slug: form.slug?.trim() ? form.slug.trim() : undefined,
    };
    try {
      if (mode === 'create') {
        const created = await createCollection(input, getClientToken());
        router.push(`/collections/${created.id}`);
      } else if (initial) {
        await updateCollection(initial.id, input, getClientToken());
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save collection');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">Name</label>
        <input
          required
          maxLength={100}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">
          Slug <span className="font-normal text-[var(--muted)]">(auto-generated if blank)</span>
        </label>
        <input
          maxLength={120}
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>
      <ImageUploadField
        label="Image"
        value={form.imageUrl}
        onChange={(imageUrl) => setForm({ ...form, imageUrl })}
        disabled={saving}
      />
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--heading)]">Priority</label>
          <input
            type="number"
            min={0}
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
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
        {saving ? 'Saving…' : mode === 'create' ? 'Create collection' : 'Save changes'}
      </button>
    </form>
  );
}
