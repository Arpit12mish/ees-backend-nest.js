'use client';

const SESSION_KEY = 'ees_guest_session_id';

export function getSessionId() {
  if (typeof window === 'undefined') return '';

  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(SESSION_KEY, id);
  return id;
}
