'use client';

// Cart updates need to reach two audiences: other components in the SAME
// tab (a plain `window` event is enough) and every OTHER open tab on this
// origin, since they all share one server-side cart via the session id in
// localStorage but each has its own `window` and never sees the first
// tab's event. BroadcastChannel is the native API for that cross-tab leg;
// it does not deliver a message back to the sender, so pairing it with the
// window event never causes a double refetch in the tab that made the change.
const CART_EVENT_NAME = 'ees-cart-updated';
const CART_CHANNEL_NAME = 'ees-cart';

function openChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }
  return new BroadcastChannel(CART_CHANNEL_NAME);
}

export function notifyCartUpdated(): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new Event(CART_EVENT_NAME));

  const channel = openChannel();
  if (channel) {
    channel.postMessage(CART_EVENT_NAME);
    channel.close();
  }
}

/** Subscribes to same-tab and cross-tab cart updates. Returns an unsubscribe function. */
export function onCartUpdated(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener(CART_EVENT_NAME, callback);

  const channel = openChannel();
  channel?.addEventListener('message', callback);

  return () => {
    window.removeEventListener(CART_EVENT_NAME, callback);
    channel?.close();
  };
}
