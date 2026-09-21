'use client';

import { useState } from 'react';
import Image from 'next/image';
import { uploadImage } from '@/lib/api/uploads.api';
import {
  addProductImage,
  deleteProductImage,
  setPrimaryProductImage,
  updateProductImage,
} from '@/lib/api/products.api';
import { getClientToken } from '@/lib/auth/token-cookie';
import { RoleGate } from '@/components/common/RoleGate';
import { ErrorState } from '@/components/common/ErrorState';
import { Badge } from '@/components/common/Badge';
import { resolveImageUrl } from '@/lib/utils/image-url';
import type { ProductImage } from '@/lib/types/product.types';

export function ProductImageManager({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: ProductImage[];
}) {
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpload() {
    if (!file || !altText.trim()) return;
    setUploading(true);
    setError('');
    const token = getClientToken();
    try {
      const uploaded = await uploadImage(file, token);
      const created = await addProductImage(
        productId,
        {
          imageUrl: uploaded.originalUrl,
          thumbnailUrl: uploaded.thumbnailUrl,
          cardUrl: uploaded.cardUrl,
          detailUrl: uploaded.detailUrl,
          storageProvider: uploaded.provider,
          mimeType: uploaded.mimeType,
          sizeBytes: uploaded.size,
          width: uploaded.width,
          height: uploaded.height,
          altText: altText.trim(),
          sortOrder: images.length,
          isPrimary: images.length === 0,
        },
        token,
      );
      setImages([...images, created]);
      setFile(null);
      setAltText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload image');
    } finally {
      setUploading(false);
    }
  }

  async function handleAltTextSave(imageId: string, nextAlt: string) {
    const token = getClientToken();
    const updated = await updateProductImage(imageId, { altText: nextAlt }, token);
    setImages(images.map((img) => (img.id === imageId ? updated : img)));
  }

  async function handleSetPrimary(imageId: string) {
    const token = getClientToken();
    await setPrimaryProductImage(imageId, token);
    setImages(images.map((img) => ({ ...img, isPrimary: img.id === imageId })));
  }

  async function handleDelete(imageId: string) {
    const token = getClientToken();
    await deleteProductImage(imageId, token);
    setImages(images.filter((img) => img.id !== imageId));
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
      <h3 className="font-semibold text-[var(--heading)]">Images</h3>

      <RoleGate permission="products.images.write">
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--heading)]">File</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--heading)]">Alt text</label>
            <input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
            />
          </div>
          <button
            type="button"
            disabled={!file || !altText.trim() || uploading}
            onClick={handleUpload}
            className="min-h-11 rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </RoleGate>

      {error ? <div className="mt-3"><ErrorState title="Upload failed" description={error} /></div> : null}

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="rounded-md border border-[var(--border)] p-2">
            <div className="relative aspect-square w-full overflow-hidden rounded bg-[var(--soft)]">
              <Image
                src={resolveImageUrl(image.thumbnailUrl || image.imageUrl)}
                alt={image.altText ?? ''}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
            {image.isPrimary ? (
              <div className="mt-1">
                <Badge tone="brand">Primary</Badge>
              </div>
            ) : null}
            <input
              defaultValue={image.altText ?? ''}
              onBlur={(e) => handleAltTextSave(image.id, e.target.value)}
              className="mt-2 w-full rounded-md border border-[var(--border)] px-2 py-1 text-xs focus:border-[var(--brand)] focus:outline-none"
              placeholder="Alt text"
            />
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <RoleGate permission="products.images.write">
                {!image.isPrimary ? (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(image.id)}
                    className="font-semibold text-[var(--brand)]"
                  >
                    Set primary
                  </button>
                ) : null}
              </RoleGate>
              <RoleGate permission="products.images.delete">
                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  className="font-semibold text-[var(--danger)]"
                >
                  Delete
                </button>
              </RoleGate>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
