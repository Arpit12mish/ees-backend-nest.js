import Link from 'next/link';
import { formatPrice } from '@/lib/utils/format-price';
import type { HeroReel } from '@/lib/types/hero-reel.types';

function IconButton({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
      {children}
    </div>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 21s-6.7-4.35-9.33-8.3C.92 10.02 1.6 6.6 4.6 5.1c2.2-1.1 4.6-.3 5.9 1.4L12 8l1.5-1.5c1.3-1.7 3.7-2.5 5.9-1.4 3 1.5 3.68 4.92 1.93 7.6C18.7 16.65 12 21 12 21z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ReelTile({ reel }: { reel: HeroReel }) {
  return (
    <div className="flex-shrink-0">
      <div className="relative aspect-[3/5] w-48 overflow-hidden rounded-2xl bg-[#1a1a1a] sm:w-56 lg:w-64">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={reel.posterUrl ?? undefined}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={reel.videoUrl} type="video/mp4" />
        </video>

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <IconButton>
            <HeartIcon />
          </IconButton>
          <IconButton>
            <CommentIcon />
          </IconButton>
          <IconButton>
            <BookmarkIcon />
          </IconButton>
          <IconButton>
            <ShareIcon />
          </IconButton>
        </div>

        {reel.product ? (
          <Link
            href={`/products/${reel.product.slug}`}
            className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 rounded-t-xl bg-white p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.25)] transition hover:bg-white/95"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight text-[#111111]">
                {reel.product.name}
              </p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                {formatPrice(reel.product.price)}
              </p>
            </div>
            <span className="flex-shrink-0 rounded-full bg-[#111111] px-4 py-1.5 text-xs font-semibold text-white">
              View
            </span>
          </Link>
        ) : null}
      </div>

      <div className="mt-2 flex flex-col items-center gap-0.5 text-white/70">
        <ChevronDownIcon />
        <span className="text-[11px] font-medium uppercase tracking-wide">swipe</span>
      </div>
    </div>
  );
}

export function HeroReelsCarousel({ reels }: { reels: HeroReel[] }) {
  if (reels.length === 0) return null;

  return (
    <div className="relative overflow-hidden py-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#0a0a0a] sm:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#0a0a0a] sm:w-16" />

      <div className="hero-reels-track flex w-max gap-4 sm:gap-6">
        {[...reels, ...reels].map((reel, index) => (
          <ReelTile key={`${reel.id}-${index}`} reel={reel} />
        ))}
      </div>

      <style>{`
        .hero-reels-track {
          animation: hero-reels-scroll 32s linear infinite;
        }
        .hero-reels-track:hover {
          animation-play-state: paused;
        }
        @keyframes hero-reels-scroll {
          from {
            transform: translateX(-50%);
          }
          to {
            transform: translateX(0%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-reels-track {
            animation: none;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}
