import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <main className="kraft grid min-h-dvh place-items-center px-4 text-center">
      <div className="max-w-md">
        <Link href="/" aria-label="Phjn Coffee, về trang chủ" className="inline-block text-ink">
          <Logo className="w-40" />
        </Link>
        <p className="mt-10 font-display text-7xl text-caramel-dark">404</p>
        <h1 className="mt-2 font-display text-3xl">Không tìm thấy trang này</h1>
        <p className="mt-2 text-ink-soft">Có thể đường dẫn đã cũ. Ly cà phê của bạn vẫn đang chờ ở thực đơn.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/menu" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-caramel-dark">
            Xem thực đơn
          </Link>
          <Link href="/" className="rounded-full border border-ink/25 px-6 py-3 text-sm font-semibold hover:border-ink/50">
            Trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
