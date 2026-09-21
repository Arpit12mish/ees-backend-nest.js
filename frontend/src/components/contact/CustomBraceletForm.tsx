'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { submitContactLead } from '@/lib/api/contact.api';

type Fields = {
  name: string;
  email: string;
  phone: string;
  location: string;
  message: string;
};

const EMPTY: Fields = { name: '', email: '', phone: '', location: '', message: '' };

const inputClass =
  'min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm text-[#17201d] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50';

export function CustomBraceletForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function update(key: keyof Fields) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      !fields.name.trim() ||
      !fields.email.trim() ||
      !fields.location.trim() ||
      !fields.message.trim()
    ) {
      setError('Full name, email, location, and message are required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await submitContactLead({
        name: fields.name.trim(),
        email: fields.email.trim(),
        phone: fields.phone.trim() || undefined,
        location: fields.location.trim(),
        source: 'CUSTOM_BRACELET',
        message: fields.message.trim(),
      });
      setSuccess(true);
      setFields(EMPTY);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-white p-5">
        <p className="text-sm font-semibold text-[var(--brand)]">Request received!</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Thank you for sharing your custom bracelet requirement. Our team will
          connect with you shortly to guide you through the design.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-4 min-h-9 rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[#17201d] hover:border-[var(--brand)]"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-4 rounded-lg border border-[var(--border)] bg-white p-5 sm:p-6"
    >
      <label className="grid gap-1.5 text-sm font-medium text-[#17201d]">
        Full Name{' '}
        <span className="text-red-600" aria-hidden="true">
          *
        </span>
        <input
          type="text"
          name="name"
          required
          value={fields.name}
          onChange={update('name')}
          disabled={busy}
          placeholder="Your full name"
          className={inputClass}
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-[#17201d]">
        Email Address{' '}
        <span className="text-red-600" aria-hidden="true">
          *
        </span>
        <input
          type="email"
          name="email"
          required
          value={fields.email}
          onChange={update('email')}
          disabled={busy}
          placeholder="you@example.com"
          className={inputClass}
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-[#17201d]">
        Mobile Number{' '}
        <span className="text-xs font-normal text-[var(--muted)]">(optional)</span>
        <input
          type="tel"
          name="phone"
          value={fields.phone}
          onChange={update('phone')}
          disabled={busy}
          placeholder="+91 99999 99999"
          className={inputClass}
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-[#17201d]">
        Location{' '}
        <span className="text-red-600" aria-hidden="true">
          *
        </span>
        <input
          type="text"
          name="location"
          required
          value={fields.location}
          onChange={update('location')}
          disabled={busy}
          placeholder="City, State"
          className={inputClass}
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-[#17201d]">
        Message{' '}
        <span className="text-red-600" aria-hidden="true">
          *
        </span>
        <textarea
          name="message"
          required
          minLength={10}
          value={fields.message}
          onChange={update('message')}
          disabled={busy}
          rows={5}
          placeholder="Tell us about the crystals, bead size, wrist size, and style you have in mind…"
          className="w-full rounded-md border border-[var(--border)] px-3 py-2.5 text-sm text-[#17201d] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50"
        />
      </label>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="min-h-11 w-full rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {busy ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  );
}
