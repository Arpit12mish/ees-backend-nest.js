'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addProductImage, createProduct, updateProduct } from '@/lib/api/products.api';
import { getClientToken } from '@/lib/auth/token-cookie';
import { ErrorState } from '@/components/common/ErrorState';
import { AttributesEditor } from './AttributesEditor';
import { StagedProductImages, type StagedProductImage } from './StagedProductImages';
import type { Category } from '@/lib/types/category.types';
import type { ProductDetail, ProductInput } from '@/lib/types/product.types';

type FormState = Omit<ProductInput, 'attributes'>;

export function ProductForm({
  mode,
  initial,
  categories,
}: {
  mode: 'create' | 'edit';
  initial?: ProductDetail;
  categories: Category[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    sku: initial?.sku ?? '',
    shortDescription: initial?.shortDescription ?? '',
    longDescription: initial?.longDescription ?? '',
    storySummary: initial?.storySummary ?? '',
    spiritualBenefitSummary: initial?.spiritualBenefitSummary ?? '',
    usageGuide: initial?.usageGuide ?? '',
    careInstructions: initial?.careInstructions ?? '',
    price: initial?.price ?? 0,
    mrp: initial?.mrp ?? 0,
    discountPercent: initial?.discountPercent ?? 0,
    categoryId: initial?.categoryId ?? categories[0]?.id ?? '',
    priority: initial?.priority ?? 0,
    badge: initial?.badge ?? '',
    inventoryQuantity: initial?.inventoryQuantity ?? 0,
    lowStockThreshold: initial?.lowStockThreshold ?? 5,
  });
  const [attributes, setAttributes] = useState<Record<string, unknown>>(
    initial?.attributes ?? {},
  );
  const [stagedImages, setStagedImages] = useState<StagedProductImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [createdProductId, setCreatedProductId] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const input: ProductInput = {
      ...form,
      slug: form.slug?.trim() ? form.slug.trim() : undefined,
      attributes,
    };
    try {
      if (mode === 'create') {
        const created = await createProduct(input, getClientToken());
        if (stagedImages.length > 0) {
          const token = getClientToken();
          const settled = await Promise.allSettled(
            stagedImages.map((img, index) =>
              addProductImage(
                created.id,
                {
                  imageUrl: img.result.originalUrl,
                  thumbnailUrl: img.result.thumbnailUrl,
                  cardUrl: img.result.cardUrl,
                  detailUrl: img.result.detailUrl,
                  storageProvider: img.result.provider,
                  mimeType: img.result.mimeType,
                  sizeBytes: img.result.size,
                  width: img.result.width,
                  height: img.result.height,
                  altText: img.altText.trim() || form.name,
                  sortOrder: index,
                  isPrimary: img.isPrimary,
                },
                token,
              ),
            ),
          );
          const failedCount = settled.filter((r) => r.status === 'rejected').length;
          if (failedCount > 0) {
            setCreatedProductId(created.id);
            setError(
              `Product created, but ${failedCount} of ${stagedImages.length} image(s) failed to attach. Open the product to add ${failedCount > 1 ? 'them' : 'it'} again.`,
            );
            setSaving(false);
            return;
          }
        }
        router.push(`/products/${created.id}`);
        return;
      } else if (initial) {
        await updateProduct(initial.id, input, getClientToken());
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save product');
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none';
  const labelClass = 'block text-sm font-medium text-[var(--heading)]';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
      {mode === 'create' ? (
        <div className="rounded-md border border-[var(--border)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--heading)]">
          Add images below if you have them ready, or skip for now — you&apos;ll be able to set stock and edit SEO details on the next screen either way.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Name</label>
          <input
            required
            maxLength={150}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>SKU</label>
          <input
            required
            maxLength={50}
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Slug <span className="font-normal text-[var(--muted)]">(auto-generated if blank)</span>
          </label>
          <input
            maxLength={160}
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select
            required
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className={inputClass}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Badge <span className="font-normal text-[var(--muted)]">(optional — shown as a small tag on the product card)</span>
        </label>
        <input
          maxLength={40}
          value={form.badge}
          onChange={(e) => setForm({ ...form, badge: e.target.value })}
          placeholder="e.g. Bestseller, Customer Favorite, Top Rated, Trending, Rare Find"
          className={inputClass}
        />
      </div>

      {mode === 'create' ? (
        <StagedProductImages images={stagedImages} onChange={setStagedImages} disabled={saving} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className={labelClass}>Price</label>
          <input
            type="number"
            min={0}
            step="0.01"
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>MRP</label>
          <input
            type="number"
            min={0}
            step="0.01"
            required
            value={form.mrp}
            onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Discount %</label>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={form.discountPercent}
            onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Priority</label>
          <input
            type="number"
            min={0}
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Inventory quantity</label>
          <input
            type="number"
            min={0}
            value={form.inventoryQuantity}
            onChange={(e) => setForm({ ...form, inventoryQuantity: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Low stock threshold</label>
          <input
            type="number"
            min={0}
            value={form.lowStockThreshold}
            onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Short description</label>
        <textarea
          rows={2}
          value={form.shortDescription}
          onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Long description</label>
        <textarea
          rows={4}
          value={form.longDescription}
          onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Story summary</label>
        <textarea
          rows={2}
          value={form.storySummary}
          onChange={(e) => setForm({ ...form, storySummary: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Spiritual benefit summary</label>
        <textarea
          rows={2}
          value={form.spiritualBenefitSummary}
          onChange={(e) => setForm({ ...form, spiritualBenefitSummary: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Usage guide</label>
        <textarea
          rows={2}
          value={form.usageGuide}
          onChange={(e) => setForm({ ...form, usageGuide: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Care instructions</label>
        <textarea
          rows={2}
          value={form.careInstructions}
          onChange={(e) => setForm({ ...form, careInstructions: e.target.value })}
          className={inputClass}
        />
      </div>

      <AttributesEditor initial={initial?.attributes} onChange={setAttributes} />

      {error ? (
        <div className="space-y-2">
          <ErrorState title={createdProductId ? 'Product created' : 'Could not save'} description={error} />
          {createdProductId ? (
            <Link href={`/products/${createdProductId}`} className="text-sm font-semibold text-[var(--brand)] hover:underline">
              Open product →
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="min-h-11 rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving…' : mode === 'create' ? 'Create product' : 'Save changes'}
        </button>
        <Link
          href="/products"
          className="min-h-11 inline-flex items-center rounded-md border border-[var(--border)] px-5 text-sm font-semibold text-[var(--heading)] hover:bg-[var(--soft)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
