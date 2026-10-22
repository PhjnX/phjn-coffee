"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

const sections = [
  { id: "top", label: "Mở đầu" },
  { id: "thuc-don", label: "Thực đơn" },
  { id: "cau-chuyen", label: "Quy trình" },
  { id: "yeu-thich", label: "Được yêu thích" },
  { id: "cua-hang", label: "Cửa hàng" },
];

/** One-page indicator on the right edge: highlights the section in view and jumps to any of them. */
export function SectionDots() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      // A thin band across the middle of the screen decides which section is "current".
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Các phần của trang"
      className={`fixed top-1/2 right-5 z-30 hidden -translate-y-1/2 transition-opacity duration-500 lg:block ${active === "top" ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <ul className="flex flex-col items-end gap-4">
        {sections.map((s) => {
          const on = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={on ? "true" : undefined}
                className="group flex items-center gap-3"
              >
                <span className="text-[11px] tracking-[0.18em] text-ink uppercase opacity-0 transition-opacity group-hover:opacity-100">
                  {s.label}
                </span>
                <span className="relative grid size-3 place-items-center">
                  <motion.span
                    className="block rounded-full bg-ink"
                    animate={{
                      width: on ? 10 : 5,
                      height: on ? 10 : 5,
                      opacity: on ? 1 : 0.45,
                      backgroundColor: on ? "#b08155" : "#3b2e25",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                  {on && (
                    <span className="absolute inset-[-4px] rounded-full border border-caramel/50" />
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
