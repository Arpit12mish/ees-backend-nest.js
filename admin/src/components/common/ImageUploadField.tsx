'use client';

import { useRef, useState } from 'react';
import { uploadImage } from '@/lib/api/uploads.api';
import { getClientToken } from '@/lib/auth/token-cookie';
import { resolveImageUrl } from '@/lib/utils/image-url';

// Shared upload widget for every single-image field in the admin
// (categories, collections, services, guides, hero reel posters, SEO
// OG/Twitter images). File picker, paste-to-upload, preview, replace, and
// remove — so no image field is ever just a bare URL text box.
export function ImageUploadField({
  label,
  hint,
  value,
  onChange,
  disabled,
  onUploadingChange,
}: {
  label: string;
  hint?: string;
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const busy = disabled || uploading;

  async function doUpload(file: File) {
    setUploading(true);
    onUploadingChange?.(true);
    setError('');
    try {
      const result = await uploadImage(file, getClientToken());
      onChange(result.detailUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload image');
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so choosing the same file again still fires onChange next time.
    event.target.value = '';
    if (file) void doUpload(file);
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
          void doUpload(file);
        }
        return;
      }
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--heading)]">{label}</label>
      {hint ? <p className="mt-0.5 text-xs text-[var(--muted)]">{hint}</p> : null}

      <div
        tabIndex={0}
        onPaste={handlePaste}
        className="mt-2 flex flex-col gap-3 rounded-md border border-dashed border-[var(--border)] p-3 focus:border-[var(--brand)] focus:outline-none sm:flex-row sm:items-center"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveImageUrl(value)}
            alt=""
            className="h-20 w-20 flex-shrink-0 rounded-md border border-[var(--border)] object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-md bg-[var(--soft)] text-center text-xs text-[var(--muted)]">
            No image
          </div>
        )}

        <div className="min-w-0 flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            disabled={busy}
            className="hidden"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="min-h-9 rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--heading)] hover:bg-[var(--soft)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : value ? 'Replace' : 'Choose file'}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={busy}
                className="min-h-9 rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--danger)] hover:bg-[var(--danger-soft)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove
              </button>
            ) : null}
          </div>
          <p className="mt-1.5 text-xs text-[var(--muted)]">
            Click to browse, or paste an image (⌘V / Ctrl+V) while this box is focused.
          </p>
          {error ? <p className="mt-1 text-xs font-medium text-[var(--danger)]">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
