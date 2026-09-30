'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { uploadImage } from '@/lib/api/uploads.api';
import { getClientToken } from '@/lib/auth/token-cookie';
import { resolveImageUrl } from '@/lib/utils/image-url';
import type { UploadImageResult } from '@/lib/types/upload.types';

export type StagedProductImage = {
  id: string;
  altText: string;
  isPrimary: boolean;
  result: UploadImageResult;
};

// Lets a new product (no id yet) collect images before it's saved. Each file
// uploads to storage immediately via the id-less /uploads/image endpoint;
// the resulting URLs are staged here and only attached to the product
// (via addProductImage) once ProductForm's submit has a real productId.
export function StagedProductImages({
  images,
  onChange,
  disabled,
}: {
  images: StagedProductImage[];
  onChange: (images: StagedProductImage[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const busy = disabled || uploading;

  async function stageFile(file: File) {
    setUploading(true);
    setError('');
    try {
      const result = await uploadImage(file, getClientToken());
      onChange([
        ...images,
        { id: crypto.randomUUID(), altText: '', isPrimary: images.length === 0, result },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload image');
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void stageFile(file);
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    if (busy) return;
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          void stageFile(file);
        }
        return;
      }
    }
  }

  function updateAlt(id: string, altText: string) {
    onChange(images.map((img) => (img.id === id ? { ...img, altText } : img)));
  }

  function setPrimary(id: string) {
    onChange(images.map((img) => ({ ...img, isPrimary: img.id === id })));
  }

  function remove(id: string) {
    const next = images.filter((img) => img.id !== id);
    if (next.length > 0 && !next.some((img) => img.isPrimary)) {
      next[0] = { ...next[0], isPrimary: true };
    }
    onChange(next);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--heading)]">
        Images <span className="font-normal text-[var(--muted)]">(optional — you can also add these later)</span>
      </label>

      <div
        tabIndex={0}
        onPaste={handlePaste}
        className="mt-2 flex flex-col gap-2 rounded-md border border-dashed border-[var(--border)] p-3 focus:border-[var(--brand)] focus:outline-none"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={busy}
          className="hidden"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="min-h-9 rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--heading)] hover:bg-[var(--soft)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Add image'}
          </button>
          <p className="text-xs text-[var(--muted)]">
            Click this box and paste (⌘V / Ctrl+V), or use the button to browse.
          </p>
        </div>
        {error ? <p className="text-xs font-medium text-[var(--danger)]">{error}</p> : null}
      </div>

      {images.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="rounded-md border border-[var(--border)] p-2">
              <div className="relative aspect-square w-full overflow-hidden rounded bg-[var(--soft)]">
                <Image
                  src={resolveImageUrl(img.result.thumbnailUrl || img.result.originalUrl)}
                  alt={img.altText}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </div>
              {img.isPrimary ? (
                <span className="mt-1 inline-block rounded bg-[var(--brand)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Primary
                </span>
              ) : null}
              <input
                value={img.altText}
                onChange={(e) => updateAlt(img.id, e.target.value)}
                placeholder="Alt text"
                disabled={disabled}
                className="mt-2 w-full rounded-md border border-[var(--border)] px-2 py-1 text-xs focus:border-[var(--brand)] focus:outline-none"
              />
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {!img.isPrimary ? (
                  <button
                    type="button"
                    onClick={() => setPrimary(img.id)}
                    disabled={disabled}
                    className="font-semibold text-[var(--brand)]"
                  >
                    Set primary
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  disabled={disabled}
                  className="font-semibold text-[var(--danger)]"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
