"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { TABLE_TTL_MS, useCart } from "@/lib/cart-store";
import { normalizeTable } from "@/lib/order";

/**
 * Each table has a QR code pointing to the menu with "?ban=<number>". When a page opens with that
 * parameter, remember the table: that is what opens ordering. A table remembered from a visit more
 * than a few hours ago is forgotten, so the site is browse-only again until the next scan.
 */
export function TableFromUrl() {
  const pathname = usePathname();
  const setTable = useCart((s) => s.setTable);

  useEffect(() => {
    const table = normalizeTable(new URLSearchParams(window.location.search).get("ban"));
    if (table) return setTable(table);
    const { table: saved, tableAt } = useCart.getState();
    if (saved && (!tableAt || Date.now() - tableAt > TABLE_TTL_MS)) setTable(null);
  }, [pathname, setTable]);

  return null;
}
