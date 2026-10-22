import Link from "next/link";
import { Logo } from "./brand/Logo";

const pages = [
  ["/", "Trang chủ"],
  ["/menu", "Thực đơn"],
  ["/#cau-chuyen", "Câu chuyện"],
  ["/#cua-hang", "Cửa hàng"],
] as const;

/** Dark brown footer: brand note, page links, hours and how to order, then the portfolio credit. */
export function Footer() {
  return (
    <footer className="bg-espresso text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr] md:px-10 md:py-16">
        <div className="sm:col-span-2 md:col-span-1">
          <Logo className="w-40 text-cream" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/75">
            Cà phê rang mỗi tuần, trà ủ trong ngày, bánh nướng mỗi sáng. Quét mã QR trên bàn để gọi món.
          </p>
        </div>
        <div>
          <h2 className="font-display text-sm font-bold">Trang</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/75">
            {pages.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition-colors hover:text-caramel">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-sm font-bold">Cửa hàng</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/75">
            <li>Sắp khai trương tại Sài Gòn</li>
            <li>Thứ 2 – Thứ 6 · 7:00 – 22:00</li>
            <li>Thứ 7 – Chủ nhật · 7:00 – 23:00</li>
            <li>Gọi món bằng mã QR trên bàn</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <p className="border-t border-cream/15 py-5 text-center text-xs leading-relaxed text-cream/60">
          Phjn Coffee là thương hiệu giả lập cho dự án portfolio của{" "}
          <a href="https://github.com/PhjnX" className="underline underline-offset-2 hover:text-cream" target="_blank" rel="noreferrer">
            Bùi Hoàng Phi
          </a>
          . Địa chỉ, giá và đơn hàng trên trang này không có thật. Ảnh: Pexels, video: Mixkit.
        </p>
      </div>
    </footer>
  );
}
