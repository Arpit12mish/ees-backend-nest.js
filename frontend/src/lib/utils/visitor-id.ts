'use client';

const VISITOR_KEY = 'ees_visitor_id';

export function getVisitorId() {
  if (typeof window === 'undefined') return '';

  const existing = window.localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;

  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(VISITOR_KEY, id);
  return id;
}
