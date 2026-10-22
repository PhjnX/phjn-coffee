"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const FIRST_MIN_MS = 1400;
const ROUTE_MIN_MS = 800;
const SAFETY_MS = 6000;

/**
 * Full-screen coffee loader. It is in the server HTML, so it covers the first paint on a visit or
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
          className="kraft fixed inset-0 z-[100] grid place-items-center"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "-6%", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
        >
          <LoaderCup />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A cup on a saucer that fills with coffee while three curls of steam rise. */
function LoaderCup() {
  const body = "M30 52h60v10c0 22-13.4 36-30 36S30 84 30 62z";
  return (
    <svg viewBox="0 0 120 120" width="128" height="128" className="size-32 text-ink" aria-hidden>
      <defs>
        <clipPath id="loader-cup">
          <path d={body} />
        </clipPath>
        <linearGradient id="loader-coffee" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c89a6b" />
          <stop offset="0.12" stopColor="#7a4a2b" />
          <stop offset="1" stopColor="#3f2416" />
        </linearGradient>
      </defs>
      {[44, 58, 72].map((x, i) => (
        <path
          key={x}
          className="loader-steam"
          style={{ animationDelay: `${i * 0.35}s` }}
          d={`M${x} 44c-5-6 5-10 0-17s5-10 0-16`}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ))}
      <g clipPath="url(#loader-cup)">
        <rect x="30" y="52" width="60" height="46" fill="#f3e8d8" />
        <rect className="loader-fill" x="30" y="52" width="60" height="46" fill="url(#loader-coffee)" />
      </g>
      <path d={body} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M90 58h5a8 8 0 0 1 0 16h-7" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M20 104h80" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
