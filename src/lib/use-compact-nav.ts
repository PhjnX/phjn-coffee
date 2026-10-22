"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useHeroScene } from "./hero-scene";

/**
 * Whether the navigation is in its compact top-bar form. On the home page the tall sidebar shows
 * only on the hero's intro scene at the very top; it folds as soon as the hero switches to its
 * video scene or the page is scrolled. Every other page uses the bar.
 * Two scroll thresholds (fold at 80px, unfold under 20px) stop it flickering around a single line.
 */
export function useCompactNav(): boolean {
  const isHome = usePathname() === "/";
  const scene = useHeroScene((s) => s.scene);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const update = () => setScrolled((was) => (was ? window.scrollY > 20 : window.scrollY > 80));
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [isHome]);

  return !isHome || scrolled || scene === "video";
}
