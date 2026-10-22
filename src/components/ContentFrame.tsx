"use client";

import { usePathname } from "next/navigation";
import { useCompactNav } from "@/lib/use-compact-nav";

/**
 * Page column. On desktop it sits right of the sidebar while that is open, then slides to full
 * width as the sidebar folds into the top bar. Pages other than home leave room for the bar.
 */
export function ContentFrame({ children }: { children: React.ReactNode }) {
  const compact = useCompactNav();
  const isHome = usePathname() === "/";
  return (
    <div
      className={`flex min-h-dvh flex-col pt-16 transition-[padding] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        compact ? "lg:pl-0" : "lg:pl-75"
      } ${isHome ? "lg:pt-0" : "lg:pt-[72px]"}`}
    >
      {children}
    </div>
  );
}
