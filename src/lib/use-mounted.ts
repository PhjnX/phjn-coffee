"use client";

import { useEffect, useState } from "react";

/**
 * True after the first client render. The cart lives in localStorage, so anything that
 * shows cart contents waits for this to avoid a server/client mismatch.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
