"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cartCount, useCart } from "@/lib/cart-store";
import type { Category } from "@/lib/types";
import { useHeroScene } from "@/lib/hero-scene";
import { useCompactNav } from "@/lib/use-compact-nav";
import { useMounted } from "@/lib/use-mounted";
import { Logo } from "./brand/Logo";

const ease = [0.22, 1, 0.36, 1] as const;

const links = (pathname: string) => [
  { href: "/", label: "Trang chủ", active: pathname === "/" },
  { href: "/menu", label: "Thực đơn", active: pathname.startsWith("/menu") },
  { href: "/#cau-chuyen", label: "Câu chuyện", active: false },
  { href: "/#cua-hang", label: "Cửa hàng", active: false },
];

/**
 * Site navigation.
 * Desktop: a tall textured sidebar at the top of the home page that folds into a slim top bar
 * as soon as the visitor scrolls (other pages use the bar straight away).
 * Phones: a top bar with a menu button that slides the sidebar in as a drawer.
 */
export function SiteNav({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const compact = useCompactNav();
  const scene = useHeroScene((st) => st.scene);
  const [pastTop, setPastTop] = useState(false);
  useEffect(() => {
    const update = () => setPastTop(window.scrollY > 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  // Over the home video banner the bar is see-through with light text; it fills in once the page scrolls.
  const overlay = pathname === "/" && scene === "video" && !pastTop;

  // Close the drawer after navigating, and lock page scroll while it is open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Desktop sidebar (expanded state) */}
      <motion.aside
        className="kraft fixed inset-y-0 left-0 z-40 hidden w-75 border-r border-line lg:block"
        initial={false}
        animate={{ x: compact ? "-100%" : 0, opacity: compact ? 0 : 1 }}
        transition={{ duration: 0.7, ease }}
        inert={compact}
      >
        <SidebarContent categories={categories} />
      </motion.aside>

      {/* Desktop top bar (compact state) */}
      <motion.header
        className={`fixed inset-x-0 top-0 z-40 hidden h-[72px] items-center justify-between border-b px-8 transition-[background-color,border-color,color] duration-500 lg:flex ${
          overlay ? "border-transparent bg-transparent text-white" : "border-line bg-paper/85 text-ink backdrop-blur-md"
        }`}
        initial={false}
        animate={{ y: compact ? 0 : "-100%", opacity: compact ? 1 : 0 }}
        transition={{ duration: 0.6, ease, delay: compact ? 0.15 : 0 }}
        inert={!compact}
      >
        <Wordmark light={overlay} />
        <nav aria-label="Chính" className="flex items-center gap-9">
          {links(pathname).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative py-2 font-display text-base transition-colors hover:text-caramel-dark ${
                l.active ? (overlay ? "text-white" : "text-caramel") : overlay ? "text-white/80 hover:text-white" : "text-ink/85"
              }`}
            >
              {l.label}
              {l.active && <span className={`absolute inset-x-0 -bottom-0.5 h-px ${overlay ? "bg-white" : "bg-caramel"}`} />}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <span className={`hidden text-xs tracking-wider xl:inline ${overlay ? "text-white/70" : "text-ink-soft"}`}>7:00 – 22:00</span>
          <CartButton light={overlay} />
        </div>
      </motion.header>

      {/* Phone top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-paper/90 px-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Mở menu"
          aria-expanded={open}
          className="grid size-10 place-items-center"
        >
          <span aria-hidden className="flex w-6 flex-col gap-1.5">
            <span className="h-px bg-ink" />
            <span className="h-px w-4 bg-ink" />
            <span className="h-px bg-ink" />
          </span>
        </button>
        <Wordmark />
        <CartButton compact />
      </header>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/65"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="kraft absolute inset-y-0 left-0 w-[86%] max-w-[320px] shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 40 }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng menu"
                className="absolute top-3 right-3 grid size-10 place-items-center text-2xl font-light"
              >
                ×
              </button>
              <SidebarContent categories={categories} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`transition-[opacity,color] duration-500 hover:opacity-80 ${light ? "text-white" : "text-ink"}`} aria-label="Phjn Coffee, về trang chủ">
      <Logo className="h-11 w-auto" />
    </Link>
  );
}

function SidebarContent({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const [home, menu, ...rest] = links(pathname);
  const item = (l: { href: string; label: string; active: boolean }) => (
    <li key={l.href}>
      <Link
        href={l.href}
        className={`font-display text-[19px] transition-colors hover:text-caramel-dark ${
          l.active ? "text-caramel-dark" : "text-ink"
        }`}
      >
        {l.label}
      </Link>
    </li>
  );

  return (
    <div className="no-scrollbar flex h-full flex-col items-center overflow-y-auto px-8 py-12 text-center">
      <Link href="/" aria-label="Phjn Coffee, về trang chủ" className="text-ink transition-opacity hover:opacity-80">
        <Logo className="w-48" />
      </Link>

      <nav aria-label="Chính" className="my-auto py-8">
        <ul className="space-y-3.5">
          {item(home)}
          {item(menu)}
          <li>
            <ul className="space-y-1 border-y border-line py-3">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/menu#cat-${c.id}`}
                    className="text-sm text-ink-soft transition-colors hover:text-caramel-dark"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          {rest.map(item)}
        </ul>
      </nav>

      <div className="space-y-3 text-xs leading-relaxed text-ink-soft">
        <p className="font-display text-base text-caramel-dark">Nhận đơn online</p>
        <p>7:00 – 22:00 · Giao khoảng 30 phút</p>
        <CartButton />
      </div>
    </div>
  );
}

/** Round cart icon with a small count badge. `light` is the white variant used over the home video. */
function CartButton({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  const mounted = useMounted();
  const lines = useCart((s) => s.lines);
  const open = useCart((s) => s.open);
  const count = mounted ? cartCount(lines) : 0;
  const tone = compact
    ? ""
    : light
      ? "border border-white/50 text-white hover:bg-white/15"
      : "border border-ink/20 text-ink hover:border-caramel hover:bg-caramel hover:text-cream";
  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Giỏ hàng, ${count} món`}
      className={`relative grid size-11 place-items-center rounded-full transition-colors ${tone}`}
    >
      <BagIcon />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-caramel px-1 text-[10px] font-semibold text-cream"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 7h12l-1 13H7L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}
