'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createHeroReel, updateHeroReel } from '@/lib/api/hero-reels.api';
import { uploadVideo } from '@/lib/api/uploads.api';
import { getProducts } from '@/lib/api/products.api';
import { getClientToken } from '@/lib/auth/token-cookie';
import { resolveImageUrl } from '@/lib/utils/image-url';
import { ErrorState } from '@/components/common/ErrorState';
import { ImageUploadField } from '@/components/common/ImageUploadField';
import type { HeroReel, HeroReelInput } from '@/lib/types/hero-reel.types';
import type { AdminProductListItem } from '@/lib/types/product.types';

export function HeroReelForm({
  mode,
  initial,
}: {
  mode: 'create' | 'edit';
  initial?: HeroReel;
}) {
  const router = useRouter();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<HeroReelInput>({
    videoUrl: initial?.videoUrl ?? '',
    posterUrl: initial?.posterUrl ?? '',
    altText: initial?.altText ?? '',
    productId: initial?.productId ?? '',
    priority: initial?.priority ?? 0,
    isActive: initial?.isActive ?? true,
  });
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    getProducts({ limit: 100 }, getClientToken())
      .then((page) => {
        if (mounted) setProducts(page.items);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  async function handleVideoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadingVideo(true);
    setError('');
    try {
      const result = await uploadVideo(file, getClientToken());
      setForm((prev) => ({ ...prev, videoUrl: result.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload video');
    } finally {
      setUploadingVideo(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.videoUrl) {
      setError('Upload a video before saving.');
      return;
    }
    setSaving(true);
    setError('');
    const input: HeroReelInput = {
      ...form,
      posterUrl: form.posterUrl?.trim() || undefined,
      altText: form.altText?.trim() || undefined,
      productId: form.productId?.trim() || undefined,
    };
    try {
      if (mode === 'create') {
        await createHeroReel(input, getClientToken());
      } else if (initial) {
        await updateHeroReel(initial.id, input, getClientToken());
      }
      router.push('/hero-reels');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save hero reel');
    } finally {
      setSaving(false);
    }
  }

  const busy = saving || uploadingVideo || uploadingPoster;

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">Video clip</label>
        <p className="mt-0.5 text-xs text-[var(--muted)]">
          A short vertical clip (e.g. saved from your own Instagram Reel). MP4 recommended, up to 30MB.
        </p>

        <div className="mt-2 flex flex-col gap-3 rounded-md border border-dashed border-[var(--border)] p-3 sm:flex-row sm:items-center">
          {form.videoUrl ? (
            <video
              src={resolveImageUrl(form.videoUrl)}
              controls
              muted
              className="h-32 w-20 flex-shrink-0 rounded-md border border-[var(--border)] bg-black object-cover"
            />
          ) : (
            <div className="flex h-32 w-20 flex-shrink-0 items-center justify-center rounded-md bg-[var(--soft)] text-center text-xs text-[var(--muted)]">
              No video
            </div>
          )}

          <div className="min-w-0 flex-1">
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoChange}
              disabled={busy}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={busy}
              className="min-h-9 rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--heading)] hover:bg-[var(--soft)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploadingVideo ? 'Uploading…' : form.videoUrl ? 'Replace video' : 'Choose video'}
            </button>
            <p className="mt-1.5 text-xs text-[var(--muted)]">MP4, WebM, or MOV — up to 30MB.</p>
          </div>
        </div>
      </div>

      <ImageUploadField
        label="Poster image"
        hint="Optional — shown before the video loads."
        value={form.posterUrl}
        onChange={(posterUrl) => setForm((prev) => ({ ...prev, posterUrl }))}
        disabled={saving || uploadingVideo}
        onUploadingChange={setUploadingPoster}
      />

      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">
          Linked product <span className="font-normal text-[var(--muted)]">(shown as a tappable tag on the reel)</span>
        </label>
        <select
          value={form.productId}
          onChange={(e) => setForm({ ...form, productId: e.target.value })}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        >
          <option value="">No product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">
          Alt text <span className="font-normal text-[var(--muted)]">(accessibility)</span>
        </label>
        <input
          maxLength={150}
          value={form.altText}
          onChange={(e) => setForm({ ...form, altText: e.target.value })}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>

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
        disabled={busy}
        className="min-h-11 rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? 'Saving…' : mode === 'create' ? 'Create reel' : 'Save changes'}
      </button>
    </form>
  );
}
