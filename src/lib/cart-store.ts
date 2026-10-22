"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MAX_QTY } from "./order";
import { lineKey } from "./pricing";
import type { ProductArtSpec, Selection } from "./types";

export type CartLine = {
  key: string;
  productId: string;
  name: string;
  /** Optional so lines saved before product photos existed still load. */
  image?: string;
  photo?: string;
  art: ProductArtSpec;
  selection: Selection;
  /** Short human-readable summary, e.g. "Vừa · 50% đường · Trân châu đen". */
  summary: string;
  note: string;
  /** Price shown to the customer. The server recalculates it at checkout. */
  unitPrice: number;
  quantity: number;
};

type AddInput = Omit<CartLine, "key" | "quantity"> & { quantity: number };

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  /** Table number from the QR code on a table ("?ban=12"); null when ordering for delivery. */
  table: string | null;
  setTable: (table: string | null) => void;
  add: (input: AddInput) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

export { MAX_QTY } from "./order";

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      table: null,
      setTable: (table) => set({ table }),
      add: (input) =>
        set((state) => {
          const key = lineKey(input.productId, input.selection, input.note);
          const existing = state.lines.find((l) => l.key === key);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.key === key ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + input.quantity) } : l,
              ),
            };
          }
          return { lines: [...state.lines, { ...input, key, quantity: Math.min(MAX_QTY, input.quantity) }] };
        }),
      setQuantity: (key, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.key !== key)
              : state.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l)),
        })),
      remove: (key) => set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "phjn-cart",
      storage: createJSONStorage(() => localStorage),
      // Lines and the table number are saved; the drawer always starts closed.
      partialize: (state) => ({ lines: state.lines, table: state.table }),
    },
  ),
);

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.quantity, 0);
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
}
