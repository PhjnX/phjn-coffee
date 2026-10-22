"use client";

import { type MotionValue, useScroll, useTransform } from "motion/react";
import { type RefObject, useEffect, useState } from "react";

/**
 * 0..1 progress of a section against the window scroll, computed from its measured position.
 * - "pin":     0 when the section top meets the viewport top, 1 when its bottom meets the viewport bottom
 *              (the stretch during which a sticky child stays pinned).
 * - "through": 0 when the section top enters at the bottom of the viewport, 1 when its bottom leaves at the top.
 * Used instead of useScroll({ target }), whose progress came out wrong for these layouts.
 */
export function useSectionProgress(ref: RefObject<HTMLElement | null>, mode: "pin" | "through"): MotionValue<number> {
  const { scrollY } = useScroll();
  const [range, setRange] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const vh = window.innerHeight;
      const [start, end] = mode === "pin" ? [top, top + el.offsetHeight - vh] : [top - vh, top + el.offsetHeight];
      setRange([start, Math.max(start + 1, end)]);
    };
    measure();
    // Layout above can shift (fonts, images, the sidebar folding), so re-measure on resize and shortly after load.
    const t = window.setTimeout(measure, 800);
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }, [ref, mode]);

  return useTransform(scrollY, range, [0, 1]);
}
