"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CupIcon } from "@/components/brand/Logo";

/** Shown when a page throws: a calm message, a retry, and a way back to the menu. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="kraft grid min-h-dvh place-items-center px-4 text-center">
      <div className="max-w-md">
        <CupIcon className="mx-auto h-12 w-14 text-caramel" />
        <h1 className="mt-5 font-display text-3xl">Có chút trục trặc</h1>
        <p className="mt-2 text-ink-soft">Trang này chưa tải được. Bạn thử lại nhé, giỏ hàng của bạn vẫn được giữ nguyên.</p>
        {error.digest && <p className="mt-2 text-xs text-ink-soft">Mã lỗi: {error.digest}</p>}
        <div className="mt-8 flex justify-center gap-3">
          <button type="button" onClick={reset} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-caramel-dark">
            Thử lại
          </button>
          <Link href="/menu" className="rounded-full border border-ink/25 px-6 py-3 text-sm font-semibold hover:border-ink/50">
            Xem thực đơn
          </Link>
        </div>
      </div>
    </main>
  );
}
