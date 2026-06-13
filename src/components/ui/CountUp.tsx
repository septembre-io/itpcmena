"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** Target number */
  end: number;
  /** Optional prefix, e.g. "+" */
  prefix?: string;
  /** Duration in ms, defaults to 1100 */
  duration?: number;
  className?: string;
}

/**
 * Animated counter — triggers once when scrolled into view.
 * Respects prefers-reduced-motion.
 *
 * @example <CountUp end={14} className="text-4xl font-extrabold text-ink" />
 * @example <CountUp end={20} prefix="+" className="text-4xl font-extrabold text-teal" />
 */
export function CountUp({
  end,
  prefix = "",
  duration = 1100,
  className = "",
}: CountUpProps) {
  const [count, setCount] = useState(end);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated.current) {
            animated.current = true;
            observer.unobserve(entry.target);

            let start: number | null = null;
            const step = (ts: number) => {
              if (!start) start = ts;
              const progress = Math.min((ts - start) / duration, 1);
              setCount(Math.round(progress * end));
              if (progress < 1) requestAnimationFrame(step);
            };
            setCount(0);
            requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count}
    </span>
  );
}
