'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGuide, updateGuide } from '@/lib/api/guides.api';
import { uploadImage } from '@/lib/api/uploads.api';
import { getClientToken } from '@/lib/auth/token-cookie';
import { resolveImageUrl } from '@/lib/utils/image-url';
import { ErrorState } from '@/components/common/ErrorState';
import type { Guide, GuideInput, GuideStatus } from '@/lib/types/guide.types';

export function GuideForm({
  mode,
  initial,
}: {
  mode: 'create' | 'edit';
  initial?: Guide;
}) {
  const router = useRouter();
  const [form, setForm] = useState<GuideInput & { tagsInput: string }>({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    excerpt: initial?.excerpt ?? '',
    bodyHtml: initial?.bodyHtml ?? '',
    coverImageUrl: initial?.coverImageUrl ?? '',
    tags: initial?.tags ?? [],
    tagsInput: (initial?.tags ?? []).join(', '),
    status: initial?.status ?? 'DRAFT',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await uploadImage(file, getClientToken());
      setForm((prev) => ({ ...prev, coverImageUrl: result.detailUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload image');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const input: GuideInput = {
      title: form.title,
      slug: form.slug?.trim() ? form.slug.trim() : undefined,
      excerpt: form.excerpt,
      bodyHtml: form.bodyHtml,
      coverImageUrl: form.coverImageUrl,
      tags: form.tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status: form.status,
    };
    try {
      if (mode === 'create') {
        const created = await createGuide(input, getClientToken());
        router.push(`/guides/${created.id}`);
      } else if (initial) {
        await updateGuide(initial.id, input, getClientToken());
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save guide');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">Title</label>
        <input
          required
          maxLength={150}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">
          Slug <span className="font-normal text-[var(--muted)]">(auto-generated if blank on create)</span>
        </label>
        <input
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">Excerpt</label>
        <textarea
          rows={2}
          maxLength={300}
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">
          Body <span className="font-normal text-[var(--muted)]">(HTML)</span>
        </label>
        <textarea
          required
          rows={12}
          value={form.bodyHtml}
          onChange={(e) => setForm({ ...form, bodyHtml: e.target.value })}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 font-mono text-xs focus:border-[var(--brand)] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">
          Tags <span className="font-normal text-[var(--muted)]">(comma separated, e.g. &quot;anxiety, sleep, amethyst&quot;)</span>
        </label>
        <input
          value={form.tagsInput}
          onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">Cover image</label>
        {form.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveImageUrl(form.coverImageUrl)}
            alt="Guide cover"
            className="mt-2 h-32 w-32 rounded-md border border-[var(--border)] object-cover"
          />
        ) : null}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          className="mt-2 block text-sm"
        />
        {uploading ? <p className="mt-1 text-xs text-[var(--muted)]">Uploading…</p> : null}
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as GuideStatus })}
          className="mt-1 w-full max-w-xs rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {error ? <ErrorState title="Could not save" description={error} /> : null}

      <button
        type="submit"
        disabled={saving || uploading}
        className="min-h-11 rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? 'Saving…' : mode === 'create' ? 'Create guide' : 'Save changes'}
      </button>
    </form>
  );
}
