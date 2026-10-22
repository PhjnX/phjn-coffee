import Link from "next/link";
import { Logo } from "./brand/Logo";

export function Footer() {
  return (
    <footer className="kraft border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 text-center md:grid-cols-3 md:px-10 md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <Logo className="w-44 text-ink" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
            Cà phê rang mỗi tuần, trà ủ trong ngày, bánh nướng mỗi sáng. Đặt online, giao tận nơi.
          </p>
        </div>
        <div>
          <h2 className="text-xs font-semibold tracking-[0.2em] text-caramel uppercase">Cửa hàng</h2>
          <p className="mt-5 text-sm leading-relaxed text-ink-soft">
            <span className="text-ink">Sắp khai trương</span> tại Sài Gòn. Hiện Phjn nhận đơn online và giao tận nơi.
          </p>
        </div>
        <div>
          <h2 className="text-xs font-semibold tracking-[0.2em] text-caramel uppercase">Đặt món</h2>
          <ul className="mt-5 space-y-3 text-sm text-ink-soft">
            <li>
              <Link href="/menu" className="transition-colors hover:text-caramel">
                Xem thực đơn
              </Link>
            </li>
            <li>Nhận đơn 7:00 – 22:00 mỗi ngày</li>
            <li>Giao khoảng 30 phút trong nội thành</li>
          </ul>
          <p className="mt-6 font-display text-lg tracking-wide text-caramel-dark">Hẹn bạn ở ly cà phê tiếp theo!</p>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-6 py-5 text-center text-xs leading-relaxed text-ink-soft md:px-10">
          Phjn Coffee là thương hiệu giả lập cho dự án portfolio của{" "}
          <a href="https://github.com/PhjnX" className="underline underline-offset-2 hover:text-ink" target="_blank" rel="noreferrer">
            Bùi Hoàng Phi
          </a>
          . Địa chỉ, giá và đơn hàng trên trang này không có thật. Ảnh: Pexels, video: Mixkit.
        </p>
      </div>
    </footer>
  );
}
