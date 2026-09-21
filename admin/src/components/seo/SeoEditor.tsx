'use client';

import { useState } from 'react';
import { upsertSeo } from '@/lib/api/seo.api';
import { getClientToken } from '@/lib/auth/token-cookie';
import { ErrorState } from '@/components/common/ErrorState';
import type { SeoEntityType, SeoInput, SeoMetadataRecord } from '@/lib/types/seo.types';

export function SeoEditor({
  entityType,
  entityId,
  initialData,
}: {
  entityType: SeoEntityType;
  entityId?: string;
  initialData: SeoMetadataRecord | null;
}) {
  const [form, setForm] = useState<Omit<SeoInput, 'entityType' | 'entityId'>>({
    seoTitle: initialData?.seoTitle ?? '',
    seoDescription: initialData?.seoDescription ?? '',
    seoKeywords: initialData?.seoKeywords ?? '',
    canonicalUrl: initialData?.canonicalUrl ?? '',
    ogTitle: initialData?.ogTitle ?? '',
    ogDescription: initialData?.ogDescription ?? '',
    ogImageUrl: initialData?.ogImageUrl ?? '',
    twitterTitle: initialData?.twitterTitle ?? '',
    twitterDescription: initialData?.twitterDescription ?? '',
    twitterImageUrl: initialData?.twitterImageUrl ?? '',
    schemaType: initialData?.schemaType ?? '',
    noindex: initialData?.noindex ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await upsertSeo({ entityType, entityId, ...form }, getClientToken());
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save SEO metadata');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
      <h3 className="font-semibold text-[var(--heading)]">SEO metadata</h3>

      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">
          SEO title <span className="text-xs text-[var(--muted)]">({(form.seoTitle ?? '').length}/70)</span>
        </label>
        <input
          maxLength={70}
          value={form.seoTitle}
          onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">
          SEO description <span className="text-xs text-[var(--muted)]">({(form.seoDescription ?? '').length}/160)</span>
        </label>
        <textarea
          rows={2}
          maxLength={160}
          value={form.seoDescription}
          onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">Keywords</label>
        <input
          value={form.seoKeywords}
          onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">
          Canonical URL <span className="font-normal text-[var(--muted)]">(auto-generated if blank)</span>
        </label>
        <input
          value={form.canonicalUrl}
          onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="noindex"
          type="checkbox"
          checked={form.noindex}
          onChange={(e) => setForm({ ...form, noindex: e.target.checked })}
          className="h-4 w-4 rounded border-[var(--border)]"
        />
        <label htmlFor="noindex" className="text-sm font-medium text-[var(--heading)]">
          Hide from search engines (noindex, nofollow)
        </label>
      </div>

      <details className="rounded-md border border-[var(--border)] p-3">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--heading)]">
          Open Graph &amp; Twitter overrides
        </summary>
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-sm font-medium text-[var(--heading)]">OG title</label>
            <input
              maxLength={70}
              value={form.ogTitle}
              onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--heading)]">OG description</label>
            <textarea
              rows={2}
              maxLength={200}
              value={form.ogDescription}
              onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--heading)]">OG image URL</label>
            <input
              value={form.ogImageUrl}
              onChange={(e) => setForm({ ...form, ogImageUrl: e.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--heading)]">Twitter title</label>
            <input
              maxLength={70}
              value={form.twitterTitle}
              onChange={(e) => setForm({ ...form, twitterTitle: e.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--heading)]">Twitter description</label>
            <textarea
              rows={2}
              maxLength={200}
              value={form.twitterDescription}
              onChange={(e) => setForm({ ...form, twitterDescription: e.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--heading)]">Twitter image URL</label>
            <input
              value={form.twitterImageUrl}
              onChange={(e) => setForm({ ...form, twitterImageUrl: e.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--heading)]">Schema type</label>
            <input
              value={form.schemaType}
              onChange={(e) => setForm({ ...form, schemaType: e.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
            />
          </div>
        </div>
      </details>

      {error ? <ErrorState title="Could not save" description={error} /> : null}
      {saved ? <p className="text-sm font-semibold text-[var(--brand)]">Saved.</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="min-h-11 rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save SEO metadata'}
      </button>
    </form>
  );
}
