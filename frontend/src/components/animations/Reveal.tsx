'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Animate direct children individually, staggered by this many seconds. Omit to animate the whole block as one. */
  stagger?: number;
  y?: number;
  delay?: number;
};

export function Reveal({
  children,
  className,
  stagger,
  y = 28,
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const container = ref.current;
      if (!container) return;

      const targets = stagger !== undefined ? Array.from(container.children) : container;

      gsap.fromTo(
        targets,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          delay,
          ease: 'power3.out',
          stagger,
          scrollTrigger: {
            trigger: container,
            start: 'top 88%',
            once: true,
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
