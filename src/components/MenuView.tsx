"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart-store";
import { formatVND, normalize } from "@/lib/format";
import type { Menu, Product } from "@/lib/types";
import { useMounted } from "@/lib/use-mounted";
import { ProductPhoto } from "./ProductImage";
import { ProductSheet } from "./ProductSheet";

const badgeText = { bestseller: "Bán chạy", new: "Mới", signature: "Đặc biệt" } as const;

/** Space the sticky bars take above a section when we scroll to it. */
const offset = () => (window.matchMedia("(min-width: 1024px)").matches ? 150 : 190);

/**
 * Menu page, laid out like a printed café menu board: a sticky bar with search and category chips,
 * then each category as a list of lines (round photo, name, dotted leader, price, note), flowing
 * into two columns on wide screens. The active category follows the scroll; tapping one scrolls
 * there smoothly. The chip row is
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
  // Ordering opens only after scanning a table's QR code; before that the menu is for browsing.
  const mounted = useMounted();
  const table = useCart((s) => s.table);
  const canOrder = mounted && table !== null;
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
      {/* Sticky bar under the site header: search and the category chips */}
      <div className="sticky top-16 z-30 border-b border-line bg-paper/95 backdrop-blur-md lg:top-[72px]">
        <div className="mx-auto flex max-w-6xl flex-col gap-0 px-4 md:px-8 lg:flex-row lg:items-center lg:gap-6 lg:py-2">
          <div className="pt-3 lg:order-2 lg:w-64 lg:shrink-0 lg:pt-0">{search}</div>
          <div
            ref={chipsRef}
            className="no-scrollbar -mx-4 flex flex-1 gap-2 overflow-x-auto px-4 py-3 lg:mx-0 lg:px-0"
            role="tablist"
            aria-label="Danh mục"
          >
            {sections.map(({ category }) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                data-cat={category.id}
                aria-selected={active === category.id}
                onClick={() => jumpTo(category.id)}
                className={`shrink-0 rounded-full border px-4 py-2 font-condensed text-[15px] tracking-[0.04em] whitespace-nowrap uppercase transition-colors ${
                  active === category.id ? "border-ink bg-ink text-cream" : "border-line bg-card text-ink-soft hover:text-ink"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 pt-8 pb-16 md:px-8 md:pt-12">
        {mounted && !table && (
          <p className="mx-auto mb-10 flex max-w-xl items-center gap-3 rounded-2xl border border-line bg-paper-2/60 px-4 py-3 text-sm text-ink-soft">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="shrink-0 text-caramel-dark" aria-hidden>
              <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
              <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
              <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
              <path d="M14.5 14.5h2v2h-2zM18.5 14.5h2M14.5 20.5h2M18.5 18.5v2h2" />
            </svg>
            <span>
              Bạn đang xem thực đơn. <strong className="font-semibold text-ink">Quét mã QR trên bàn</strong> để gọi món.
            </span>
          </p>
        )}
        {sections.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-display text-2xl">Không tìm thấy “{query}”</p>
            <p className="mt-2 text-sm text-ink-soft">Thử gõ không dấu, ví dụ “tra dao”.</p>
          </div>
        )}

        {/* Menu board: categories flow into two columns on wide screens, like a printed café menu */}
        <div className="md:columns-2 md:gap-16">
          {sections.map(({ category, products }) => (
            <section
              key={category.id}
              id={`cat-${category.id}`}
              aria-labelledby={`h-${category.id}`}
              className="mb-12 break-inside-avoid scroll-mt-44 md:mb-14 lg:scroll-mt-36"
            >
              <h2 id={`h-${category.id}`} className="font-condensed text-[30px] leading-none font-medium tracking-[0.01em] uppercase md:text-[36px]">
                {category.name}
              </h2>
              <ul className="mt-5 space-y-1">
                {products.map((p) => (
                  <li key={p.id}>
                    <MenuItem product={p} onSelect={setSelected} canOrder={canOrder} />
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

/**
 * One line of the menu board: a round photo, the name in condensed capitals, a dotted leader to
 * the price, and the note underneath. The whole line opens the item. While ordering at a table a
 * small + sits on the photo.
 */
function MenuItem({ product: p, onSelect, canOrder }: { product: Product; onSelect: (p: Product) => void; canOrder: boolean }) {
  const soldOut = !p.isAvailable;
  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => onSelect(p)}
      className="group flex w-full items-center gap-4 rounded-2xl py-2.5 text-left transition-colors hover:bg-paper-2/50 disabled:cursor-not-allowed md:-mx-2 md:w-[calc(100%+1rem)] md:px-2"
    >
      <span className="relative shrink-0">
        <ProductPhoto
          item={p}
          className={`size-[72px] rounded-full ring-4 ring-espresso/90 md:size-20 ${soldOut ? "opacity-60 grayscale" : ""}`}
          sizes="80px"
        />
        {!soldOut && canOrder && (
          <span aria-hidden className="absolute -right-1 -bottom-1 grid size-6 place-items-center rounded-full bg-caramel text-sm leading-none text-white ring-2 ring-paper">
            +
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline">
          <span className="font-condensed text-[17px] leading-tight font-medium tracking-[0.01em] uppercase transition-colors group-hover:text-caramel-dark md:text-[19px]">
            {p.name}
          </span>
          {p.badge && !soldOut && (
            <span className="ml-2 hidden shrink-0 self-center rounded-full bg-paper-2 px-2 py-0.5 text-[10px] font-semibold text-caramel-dark md:inline">{badgeText[p.badge]}</span>
          )}
          <span aria-hidden className="leader" />
          <span className="shrink-0 font-condensed text-[17px] font-medium tabular-nums md:text-[19px]">{formatVND(p.basePrice)}</span>
        </span>
        <span className="mt-1 line-clamp-2 block text-[13px] leading-snug text-ink-soft md:text-sm">
          {/* On phones the badge moves down here so the name keeps the whole line. */}
          {p.badge && !soldOut && <span className="mr-1.5 font-semibold text-caramel-dark md:hidden">{badgeText[p.badge]} ·</span>}
          {soldOut ? "Tạm hết hôm nay" : p.description}
        </span>
      </span>
      <span className="sr-only">{soldOut ? "Món này đang tạm hết" : canOrder ? `Chọn ${p.name}` : `Xem ${p.name}`}</span>
    </button>
  );
}
