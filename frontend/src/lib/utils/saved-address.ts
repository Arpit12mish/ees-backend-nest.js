'use client';

export type SavedAddress = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

const ADDRESS_KEY = 'ees_saved_address';

export function getSavedAddress(): SavedAddress | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(ADDRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedAddress>;
    if (!parsed.line1 || !parsed.city || !parsed.pincode) return null;
    return {
      customerName: parsed.customerName ?? '',
      customerEmail: parsed.customerEmail ?? '',
      customerPhone: parsed.customerPhone ?? '',
      line1: parsed.line1 ?? '',
      line2: parsed.line2 ?? '',
      city: parsed.city ?? '',
      state: parsed.state ?? '',
      pincode: parsed.pincode ?? '',
      country: parsed.country ?? 'India',
    };
  } catch {
    return null;
  }
}

export function saveAddress(address: SavedAddress) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ADDRESS_KEY, JSON.stringify(address));
  } catch {
    // storage unavailable (private browsing, quota) — silently skip caching
  }
}

export function clearSavedAddress() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ADDRESS_KEY);
  } catch {
    // ignore
  }
}
