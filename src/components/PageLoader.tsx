"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const FIRST_MIN_MS = 1400;
const ROUTE_MIN_MS = 800;
const SAFETY_MS = 6000;

/**
 * Full-screen coffee loader on the brand navy: a phin drips into a glass that fills with coffee. It is in the server HTML, so it covers the first paint on a visit or
 * reload and lifts once the page has loaded. Clicking a link to another page shows it again until
 * the new route renders. Same-page links (hashes, query changes) don't trigger it.
 */
export function PageLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const shownAt = useRef(0);
  const firstPath = useRef(true);

  // First visit / reload: hide after the window load event, but not before the cup has filled once.
  useEffect(() => {
    shownAt.current = performance.now();
    const hide = () => {
      const wait = Math.max(0, FIRST_MIN_MS - (performance.now() - shownAt.current));
      window.setTimeout(() => setVisible(false), wait);
    };
    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide, { once: true });
    const safety = window.setTimeout(() => setVisible(false), SAFETY_MS);
    return () => {
      window.removeEventListener("load", hide);
      window.clearTimeout(safety);
    };
  }, []);

  // Show again when an internal link to a different page is clicked.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      shownAt.current = performance.now();
      setVisible(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // New route rendered: lift the loader after a short minimum so it never just flickers.
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    const wait = Math.max(0, ROUTE_MIN_MS - (performance.now() - shownAt.current));
    const t = window.setTimeout(() => setVisible(false), wait);
    const safety = window.setTimeout(() => setVisible(false), SAFETY_MS);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(safety);
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          role="status"
          aria-label="Đang tải"
          className="fixed inset-0 z-[100] grid place-items-center bg-espresso"
          initial={false}
          animate={{ y: 0 }}
          // Lifts away like a curtain to show the page underneath.
          exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
        >
          <LoaderPhin />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * A phin filter on a glass: drops fall from the phin, the coffee rises with a rippling surface
 * and a band of crema, and a brass arc turns around it all.
 */
function LoaderPhin() {
  const glass = "M41 56 45 108q.5 4 4.5 4h21q4 0 4.5-4L79 56Z";
  // A gentle wave 60 units long, repeated so sliding it by one period loops seamlessly.
  const wave = (y: number) => `M-60 ${y}${" q15 -4 30 0 t30 0".repeat(5)} V170 H-60 Z`;
  return (
    <svg viewBox="0 0 120 140" width="168" height="196" className="h-48 w-40 text-cream" aria-hidden>
      <defs>
        <clipPath id="loader-glass">
          <path d={glass} />
        </clipPath>
        <linearGradient id="loader-coffee" x1="0" y1="60" x2="0" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8a5a33" />
          <stop offset="1" stopColor="#3b2416" />
        </linearGradient>
      </defs>

      {/* turning brass arc */}
      <circle cx="60" cy="70" r="56" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1.5" />
      <circle className="loader-arc" cx="60" cy="70" r="56" fill="none" stroke="#c9a14e" strokeWidth="2" strokeLinecap="round" strokeDasharray="70 282" />

      {/* phin: knob, lid, chamber, plate */}
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
        <rect x="56" y="17" width="8" height="4" rx="1.5" />
        <rect x="46" y="21" width="28" height="5" rx="2" />
        <path d="M48 26 50 45h20l2-19" />
        <path d="M37 48h46" strokeWidth="2.8" />
      </g>

      {/* drops */}
      {[0, 0.3, 0.6].map((d) => (
        <ellipse key={d} className="loader-drop" style={{ animationDelay: `${d}s` }} cx="60" cy="52" rx="1.6" ry="2.4" fill="#c9a14e" />
      ))}

      {/* coffee rising inside the glass */}
      <g clipPath="url(#loader-glass)">
        <rect x="38" y="54" width="44" height="60" fill="currentColor" fillOpacity="0.08" />
        <g className="loader-level">
          <g className="loader-wave-slow">
            <path d={wave(109)} fill="#c9a14e" />
          </g>
          <g className="loader-wave">
            <path d={wave(112)} fill="url(#loader-coffee)" />
          </g>
        </g>
      </g>

      {/* glass outline and a highlight */}
      <path d={glass} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M47 64 49.5 100" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
