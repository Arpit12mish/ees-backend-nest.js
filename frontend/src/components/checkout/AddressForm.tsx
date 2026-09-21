'use client';

import { FormEvent } from 'react';
import type { SavedAddress } from '@/lib/utils/saved-address';

const FIELDS: [keyof SavedAddress, string, boolean][] = [
  ['customerName', 'Full name', true],
  ['customerEmail', 'Email', true],
  ['customerPhone', 'Phone', true],
  ['line1', 'Address line 1', true],
  ['line2', 'Address line 2', false],
  ['city', 'City', true],
  ['state', 'State', true],
  ['pincode', 'Pincode', true],
  ['country', 'Country', true],
];

const EMPTY: SavedAddress = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

export function AddressForm({
  initialValues,
  busy,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initialValues?: SavedAddress | null;
  busy?: boolean;
  submitLabel: string;
  onSubmit: (address: SavedAddress) => void;
  onCancel?: () => void;
}) {
  const defaults = initialValues ?? EMPTY;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const address = FIELDS.reduce((acc, [name]) => {
      acc[name] = String(form.get(name) || '').trim();
      return acc;
    }, {} as SavedAddress);
    onSubmit(address);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {FIELDS.map(([name, label, required]) => (
        <label key={name} className="grid gap-1.5 text-sm font-medium text-[#17201d]">
          {label}
          {required ? (
            <span className="text-red-600" aria-hidden="true">
              {' '}
              *
            </span>
          ) : (
            <span className="text-xs font-normal text-[var(--muted)]"> (optional)</span>
          )}
          <input
            name={name}
            type={name === 'customerEmail' ? 'email' : 'text'}
            required={required}
            defaultValue={defaults[name]}
            disabled={busy}
            className="min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-base text-[#17201d] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50 sm:text-sm"
          />
        </label>
      ))}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          disabled={busy}
          className="min-h-12 flex-1 rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white disabled:opacity-50 sm:flex-none"
        >
          {busy ? 'Processing…' : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-12 rounded-md border border-[var(--border)] px-5 text-sm font-semibold text-[#17201d] disabled:opacity-50"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
