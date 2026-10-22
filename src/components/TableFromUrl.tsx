"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";
import { normalizeTable } from "@/lib/order";

/**
 * Each table has a QR code pointing to the menu with "?ban=<number>". When a page opens with that
 * parameter, remember the table so the cart and checkout switch to ordering at the table.
 */
export function TableFromUrl() {
  const pathname = usePathname();
  const setTable = useCart((s) => s.setTable);

  useEffect(() => {
    const table = normalizeTable(new URLSearchParams(window.location.search).get("ban"));
    if (table) setTable(table);
  }, [pathname, setTable]);

  return null;
}
