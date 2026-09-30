'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Container } from '@/components/common/Container';
import { HeroReelsCarousel } from '@/components/home/HeroReelsCarousel';
import type { HeroReel } from '@/lib/types/hero-reel.types';

export function HeroSection({ reels }: { reels: HeroReel[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-hero-heading]', { autoAlpha: 0, y: 24, duration: 0.7 })
        .from(
          '[data-hero-reels]',
          { autoAlpha: 0, y: 16, duration: 0.6 },
          '-=0.3',
        );
    },
    { scope: rootRef },
  );

  if (reels.length > 0) {
    return (
      <section ref={rootRef} className="relative overflow-hidden bg-[#0a0a0a] py-8 sm:py-12">
        <div data-hero-reels className="px-4 sm:px-6 lg:px-10">
          <HeroReelsCarousel reels={reels} />
          <p className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
            Reels / Videos
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={rootRef} className="relative overflow-hidden bg-white text-[#111111]">
      <Container className="relative py-16 sm:py-20 lg:py-28">
        <h1
          data-hero-heading
          className="max-w-5xl font-display uppercase leading-[1.05] font-black tracking-[0.02em] text-[clamp(2.75rem,9vw,9rem)]"
        >
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
            <span className="whitespace-nowrap">Gift</span>
            <div className="relative h-[1em] w-[2.5em] flex-1 min-w-0 overflow-hidden rounded-l sm:w-[3.5em] sm:rounded-2xl lg:w-[5em]">
              <video
                aria-hidden="true"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source
                  src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
          </div>
          <span className="block sm:whitespace-nowrap">good energy</span>
        </h1>
      </Container>
    </section>
  );
}
