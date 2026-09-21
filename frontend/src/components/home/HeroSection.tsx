'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Container } from '@/components/common/Container';

export function HeroSection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-hero-heading]', { autoAlpha: 0, y: 24, duration: 0.7 });
    },
    { scope: rootRef },
  );

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
