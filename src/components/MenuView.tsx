"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart-store";
import { formatVND, normalize } from "@/lib/format";
import type { Menu, Product } from "@/lib/types";
import { ProductPhoto } from "./ProductImage";
import { ProductSheet } from "./ProductSheet";

const badgeText = { bestseller: "Bán chạy", new: "Mới", signature: "Đặc biệt" } as const;

/** Space the sticky bars take above a section when we scroll to it. */
const offset = () => (window.matchMedia("(min-width: 1024px)").matches ? 96 : 200);

/**
 * Menu page. Phones: a sticky bar with search and category chips. Desktop: a sticky side column
 * with search and the category list. Items are horizontal cards (photo, name, note, price, +).
 * The active category follows the scroll; tapping one scrolls there smoothly. The chip row is
 * scrolled sideways on its own, never the page, so the scroll never jumps.
 */
export function MenuView({ menu, initialProductSlug }: { menu: Menu; initialProductSlug?: string }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(menu.categories[0]?.id ?? "");
  const [selected, setSelected] = useState<Product | null>(
    () => menu.products.find((p) => p.slug === initialProductSlug && p.isAvailable) ?? null,
  );
  const [toast, setToast] = useState<string | null>(null);
  const openCart = useCart((s) => s.open);
  const chipsRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const spyPaused = useRef(false);

  const q = normalize(query);
  const sections = useMemo(
    () =>
      [...menu.categories]
        .sort((a, b) => a.sort - b.sort)
        .map((c) => ({
          category: c,
          products: menu.products.filter(
            (p) => p.categoryId === c.id && (q === "" || normalize(p.name).includes(q) || normalize(p.description).includes(q)),
          ),
        }))
        .filter((s) => s.products.length > 0),
    [menu, q],
  );

  // Scroll spy: the section crossing a line just under the sticky bars is the active one.
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(`cat-${s.category.id}`)).filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        if (spyPaused.current) return;
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id.replace("cat-", ""));
      },
      { rootMargin: "-200px 0px -55% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  // Centre the active chip by scrolling the chip row itself (scrollIntoView would also move the page).
  useEffect(() => {
    const row = chipsRef.current;
    const chip = row?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    if (!row || !chip) return;
    row.scrollTo({ left: chip.offsetLeft - row.clientWidth / 2 + chip.offsetWidth / 2, behavior: "smooth" });
  }, [active]);

  const jumpTo = useCallback((id: string) => {
    const el = document.getElementById(`cat-${id}`);
    if (!el) return;
    setActive(id);
    spyPaused.current = true;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset(), behavior: "smooth" });
    window.setTimeout(() => (spyPaused.current = false), 900);
  }, []);

  // Arriving with #cat-xxx (from the sidebar or the home page): land under the sticky bars.
  useEffect(() => {
    const id = window.location.hash.replace("#cat-", "");
    if (id && id !== window.location.hash) window.setTimeout(() => jumpTo(id), 50);
  }, [jumpTo]);

  const closeSheet = useCallback(() => setSelected(null), []);
  const onAdded = useCallback((name: string) => {
    setToast(name);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const search = (
    <label className="relative block">
      <span className="sr-only">Tìm món</span>
      <svg className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-soft" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm món…"
        className="w-full rounded-full border border-line bg-card py-2.5 pr-4 pl-10 text-base outline-none placeholder:text-ink-soft/60 focus:border-caramel lg:text-sm"
      />
    </label>
  );

  return (
    <>
      {/* Phones: sticky search + chips */}
      <div className="sticky top-16 z-30 border-b border-line bg-paper/95 backdrop-blur-md lg:hidden">
        <div className="px-4 pt-3">{search}</div>
        <div ref={chipsRef} className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3" role="tablist" aria-label="Danh mục">
          {sections.map(({ category }) => (
            <button
              key={category.id}
              type="button"
              role="tab"
              data-cat={category.id}
              aria-selected={active === category.id}
              onClick={() => jumpTo(category.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                active === category.id ? "border-ink bg-ink text-cream" : "border-line bg-card text-ink-soft"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-6 pb-10 md:px-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14 lg:pt-10">
        {/* Desktop: sticky side column */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-6">
            {search}
            <nav aria-label="Danh mục">
              <ul className="space-y-0.5">
                {sections.map(({ category, products }) => {
                  const on = active === category.id;
                  return (
                    <li key={category.id}>
                      <button
                        type="button"
                        onClick={() => jumpTo(category.id)}
                        aria-current={on ? "true" : undefined}
                        className={`relative flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left transition-colors ${
                          on ? "text-ink" : "text-ink-soft hover:bg-paper-2/60 hover:text-ink"
                        }`}
                      >
                        {on && (
                          <motion.span
                            layoutId="menu-side"
                            className="absolute inset-0 rounded-xl bg-paper-2"
                            transition={{ type: "spring", stiffness: 500, damping: 40 }}
                          />
                        )}
                        <span className="relative font-display text-[17px]">{category.name}</span>
                        <span className="relative text-xs tabular-nums">{products.length}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>

        <div>
          {sections.length === 0 && (
            <div className="py-24 text-center">
              <p className="font-display text-2xl">Không tìm thấy “{query}”</p>
              <p className="mt-2 text-sm text-ink-soft">Thử gõ không dấu, ví dụ “tra dao”.</p>
            </div>
          )}

          {sections.map(({ category, products }) => (
            <section key={category.id} id={`cat-${category.id}`} aria-labelledby={`h-${category.id}`} className="mb-12 scroll-mt-52 lg:scroll-mt-24">
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 id={`h-${category.id}`} className="font-display text-2xl md:text-3xl">
                  {category.name}
                </h2>
                <span className="text-sm text-ink-soft">{products.length} món</span>
              </div>
              <ul className="grid gap-3 md:grid-cols-2 md:gap-4">
                {products.map((p) => (
                  <li key={p.id}>
                    <MenuItem product={p} onSelect={setSelected} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <ProductSheet product={selected} groups={menu.optionGroups} onClose={closeSheet} onAdded={onAdded} />

      {/* "Added to cart" toast */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="pointer-events-auto flex items-center gap-4 rounded-full bg-ink py-2 pr-2 pl-5 text-sm text-cream shadow-xl"
            >
              <span>
                Đã thêm <strong className="font-semibold">{toast}</strong>
              </span>
              <button type="button" onClick={openCart} className="rounded-full bg-caramel px-4 py-2 font-semibold text-cream transition-colors hover:bg-caramel-dark">
                Xem giỏ
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/** Horizontal item card: square photo, name with badge, two-line note, price and a round + button. */
function MenuItem({ product: p, onSelect }: { product: Product; onSelect: (p: Product) => void }) {
  const soldOut = !p.isAvailable;
  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => onSelect(p)}
      className="group flex w-full items-stretch gap-4 rounded-2xl border border-line/70 bg-card p-3 text-left transition-[box-shadow,border-color] hover:border-line hover:shadow-[0_10px_30px_-18px_rgb(59_46_37/0.45)] disabled:cursor-not-allowed"
    >
      <ProductPhoto
        item={p}
        className={`aspect-square w-24 shrink-0 rounded-xl sm:w-28 ${soldOut ? "opacity-60 grayscale" : ""}`}
        sizes="112px"
      />
      <span className="flex min-w-0 flex-1 flex-col py-0.5">
        <span className="flex items-start gap-2">
          <span className="font-display text-lg leading-snug">{p.name}</span>
          {p.badge && !soldOut && (
            <span className="mt-1 shrink-0 rounded-full bg-paper-2 px-2 py-0.5 text-[10px] font-semibold text-caramel-dark">{badgeText[p.badge]}</span>
          )}
        </span>
        <span className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink-soft">{soldOut ? "Tạm hết hôm nay" : p.description}</span>
        <span className="mt-auto flex items-center justify-between pt-2">
          <span className="font-semibold tabular-nums">{formatVND(p.basePrice)}</span>
          {!soldOut && (
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-full bg-ink text-lg leading-none text-cream transition-colors group-hover:bg-caramel-dark"
            >
              +
            </span>
          )}
        </span>
      </span>
      <span className="sr-only">{soldOut ? "Món này đang tạm hết" : `Chọn ${p.name}`}</span>
    </button>
  );
}
