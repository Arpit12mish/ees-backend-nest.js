'use client';

const SCROLL_ID = 'best-sellers-scroll';

function scroll(direction: 1 | -1) {
  const el = document.getElementById(SCROLL_ID);
  if (!el) return;
  el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
}

export function BestSellersArrows() {
  return (
    <div className="hidden items-center gap-2 sm:flex">
      <button
        type="button"
        aria-label="Scroll best sellers left"
        onClick={() => scroll(-1)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[#111111] hover:border-[#111111]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Scroll best sellers right"
        onClick={() => scroll(1)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[#111111] hover:border-[#111111]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
