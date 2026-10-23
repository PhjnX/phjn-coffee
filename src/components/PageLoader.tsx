"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const FIRST_MIN_MS = 1400;
const ROUTE_MIN_MS = 800;
const SAFETY_MS = 6000;

/**
 * Full-screen coffee loader, navy line drawing on cream: the logo's cup fills while steam rises. It is in the server HTML, so it covers the first paint on a visit or
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
          className="fixed inset-0 z-[100] grid place-items-center bg-paper"
          initial={false}
          animate={{ y: 0 }}
          // Lifts away like a curtain to show the page underneath.
          exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
        >
          <LoaderCup />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * The logo's cup on its saucer, drawn as navy outlines on the cream page colour: two curls of steam rise
 * and fade, a wavy line fills the cup, and a thin arc turns around it.
 */
function LoaderCup() {
  const body = "M10 17h26v4c0 7-5.5 12-13 12S10 28 10 21z";
  // A small wave 12 units long, repeated so sliding it by one period loops seamlessly.
  const wave = `M-2 32${" q3 -1.2 6 0 t6 0".repeat(5)}`;
  return (
    <svg viewBox="0 0 120 120" width="112" height="112" className="size-28 text-ink" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="60" cy="60" r="56" strokeOpacity="0.12" strokeWidth="1.5" />
      <circle className="loader-arc" cx="60" cy="60" r="56" strokeWidth="2" strokeDasharray="70 282" />

      {/* the logo cup, scaled up; strokes keep their width */}
      <g transform="translate(18.6 25.8) scale(1.8)">
        <defs>
          <clipPath id="loader-cup">
            <path d={body} />
          </clipPath>
        </defs>
        <path className="loader-steam" d="M20 2c-3 3 3 5 0 9" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <path className="loader-steam" style={{ animationDelay: "0.6s" }} d="M27 3c-3 3 3 5 0 9" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <path d={body} fill="var(--paper)" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
        <g clipPath="url(#loader-cup)">
          <g className="loader-level">
            <g className="loader-wave">
              <path d={wave} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </g>
          </g>
        </g>
        <path d="M36 20h2.5a4 4 0 0 1 0 8H34" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
        <path d="M6 35.5h34" strokeWidth="2.8" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}
