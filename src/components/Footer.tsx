import Link from "next/link";
import { Logo } from "./brand/Logo";

export function Footer() {
  return (
    <footer className="bg-espresso text-cream">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 text-center md:grid-cols-3 md:px-10 md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <Logo className="w-44 text-cream" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/75">
            Cà phê rang mỗi tuần, trà ủ trong ngày, bánh nướng mỗi sáng. Quét mã QR trên bàn để gọi món.
          </p>
        </div>
        <div>
          <h2 className="text-xs font-semibold tracking-[0.2em] text-caramel uppercase">Cửa hàng</h2>
          <p className="mt-5 text-sm leading-relaxed text-cream/75">
            <span className="font-semibold text-cream">Sắp khai trương</span> tại Sài Gòn. Món được gọi qua mã QR trên từng bàn.
          </p>
        </div>
        <div>
          <h2 className="text-xs font-semibold tracking-[0.2em] text-caramel uppercase">Đặt món</h2>
          <ul className="mt-5 space-y-3 text-sm text-cream/75">
            <li>
              <Link href="/menu" className="transition-colors hover:text-caramel">
                Xem thực đơn
              </Link>
            </li>
            <li>Mở cửa 7:00 – 22:00 mỗi ngày</li>
            <li>Gọi món bằng mã QR trên bàn</li>
          </ul>
          <p className="mt-6 font-display text-lg tracking-wide text-caramel">Hẹn bạn ở ly cà phê tiếp theo!</p>
        </div>
      </div>
      <div className="border-t border-cream/15">
        <p className="mx-auto max-w-6xl px-6 py-5 text-center text-xs leading-relaxed text-cream/75 md:px-10">
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
