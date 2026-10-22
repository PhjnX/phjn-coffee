"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { cartCount, cartSubtotal, MAX_QTY, useCart } from "@/lib/cart-store";
import { formatVND } from "@/lib/format";
import { useMounted } from "@/lib/use-mounted";
import { ProductArt } from "./ProductArt";
import { ProductPhoto } from "./ProductImage";
import { QuantityStepper } from "./QuantityStepper";

export function CartDrawer() {
  const mounted = useMounted();
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [isOpen, close]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <Panel />
        </div>
      )}
    </AnimatePresence>
  );
}

function Panel() {
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const close = useCart((s) => s.close);
  const table = useCart((s) => s.table);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  const count = cartCount(lines);
  const subtotal = cartSubtotal(lines);

  return (
    <motion.aside
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Giỏ hàng"
      tabIndex={-1}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 380, damping: 40 }}
      className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-2xl outline-none"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="font-display text-2xl font-medium">
          Giỏ hàng{" "}
          {count > 0 && (
            <span className="text-base font-normal text-ink-soft">
              · {count} món
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label="Đóng giỏ hàng"
          className="grid size-10 place-items-center rounded-full text-xl transition-colors hover:bg-paper-2"
        >
          ×
        </button>
      </div>

      {table && (
        <div className="border-b border-line bg-paper-2/60 px-5 py-3 text-sm">
          Gọi món tại <strong className="font-semibold">bàn {table}</strong> ·
          nhân viên sẽ mang món ra bàn
        </div>
      )}

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <ProductArt
            art={{ kind: "cup", liquid: ["#efe6d7", "#e2d4bd"] }}
            className="h-32 w-auto opacity-70"
          />
          <p className="mt-4 font-display text-xl">Giỏ hàng đang trống</p>
          <p className="mt-1 text-sm text-ink-soft">
            Chọn một ly cà phê hoặc một chiếc bánh để bắt đầu.
          </p>
          <Link
            href="/menu"
            onClick={close}
            className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-caramel"
          >
            Xem thực đơn
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-line overflow-y-auto overscroll-contain px-5">
            <AnimatePresence initial={false}>
              {lines.map((line) => (
                <motion.li
                  key={line.key}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-4 py-4">
                    <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-paper-2/70">
                      <ProductPhoto
                        item={line}
                        className="size-20 rounded-2xl"
                        sizes="80px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold leading-tight">
                          {line.name}
                        </p>
                        <p className="shrink-0 text-sm font-semibold tabular-nums">
                          {formatVND(line.unitPrice * line.quantity)}
                        </p>
                      </div>
                      {line.summary && (
                        <p className="mt-1 text-xs leading-snug text-ink-soft">
                          {line.summary}
                        </p>
                      )}
                      {line.note && (
                        <p className="mt-1 text-xs text-ink-soft italic">
                          “{line.note}”
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <QuantityStepper
                          size="sm"
                          min={0}
                          max={MAX_QTY}
                          value={line.quantity}
                          onChange={(v) => setQuantity(line.key, v)}
                          label={`Số lượng ${line.name}`}
                        />
                        <button
                          type="button"
                          onClick={() => remove(line.key)}
                          className="text-xs text-ink-soft underline-offset-2 hover:text-caramel-dark hover:underline"
                        >
                          Xoá
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="space-y-3 border-t border-line bg-paper/60 px-5 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-soft">Tạm tính</span>
              <span className="text-lg font-semibold tabular-nums">
                {formatVND(subtotal)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={close}
              className="flex w-full items-center justify-center rounded-full bg-caramel py-3.5 text-sm font-semibold text-white transition-colors hover:bg-caramel-dark"
            >
              Đặt hàng · {formatVND(subtotal)}
            </Link>
          </div>
        </>
      )}
    </motion.aside>
  );
}
