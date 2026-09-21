'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { submitProductReview } from '@/lib/api/reviews.api';

type Fields = {
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  comment: string;
};

const EMPTY: Fields = { customerName: '', customerEmail: '', rating: 5, title: '', comment: '' };

const inputClass =
  'min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm text-[#111111] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50';

export function ReviewForm({ productSlug }: { productSlug: string }) {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function update(key: keyof Fields) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!fields.customerName.trim() || !fields.customerEmail.trim() || !fields.comment.trim()) {
      setError('Name, email, and review are required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await submitProductReview(productSlug, {
        customerName: fields.customerName.trim(),
        customerEmail: fields.customerEmail.trim(),
        rating: Number(fields.rating),
        title: fields.title.trim() || undefined,
        comment: fields.comment.trim(),
      });
      setSuccess(true);
      setFields(EMPTY);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-white p-5">
        <p className="text-sm font-semibold text-[var(--brand)]">Thank you for your review!</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          It will appear here once our team approves it.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-4 rounded-lg border border-[var(--border)] bg-white p-5"
    >
      <label className="grid gap-1.5 text-sm font-medium text-[#111111]">
        Rating
        <select
          value={fields.rating}
          onChange={update('rating')}
          disabled={busy}
          className={inputClass}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n === 1 ? '' : 's'}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-[#111111]">
        Name <span className="text-red-600" aria-hidden="true">*</span>
        <input
          value={fields.customerName}
          onChange={update('customerName')}
          disabled={busy}
          placeholder="Your name"
          className={inputClass}
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-[#111111]">
        Email <span className="text-red-600" aria-hidden="true">*</span>
        <input
          type="email"
          value={fields.customerEmail}
          onChange={update('customerEmail')}
          disabled={busy}
          placeholder="you@example.com"
          className={inputClass}
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-[#111111]">
        Title <span className="text-xs font-normal text-[var(--muted)]">(optional)</span>
        <input
          value={fields.title}
          onChange={update('title')}
          disabled={busy}
          placeholder="Summarize your experience"
          className={inputClass}
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-[#111111]">
        Review <span className="text-red-600" aria-hidden="true">*</span>
        <textarea
          value={fields.comment}
          onChange={update('comment')}
          disabled={busy}
          rows={4}
          placeholder="What did you think?"
          className="w-full rounded-md border border-[var(--border)] px-3 py-2.5 text-sm text-[#111111] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50"
        />
      </label>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="min-h-11 w-full rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 sm:w-auto"
      >
        {busy ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  );
}
