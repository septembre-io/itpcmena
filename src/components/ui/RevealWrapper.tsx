"use client";

import { useEffect, useRef } from "react";

interface RevealWrapperProps {
  children: React.ReactNode;
  className?: string;
  /** Threshold 0–1, defaults to 0.1 */
  threshold?: number;
}

/**
 * Wraps children in a div that fades+slides in when scrolled into view.
 * Respects prefers-reduced-motion via CSS (see globals.css).
 */
export function RevealWrapper({
  children,
  className = "",
  threshold = 0.1,
}: RevealWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
