import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { adminPassword, DEV_PASSWORD, isAdmin } from "@/lib/server/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Đăng nhập quản trị", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const usingDevPassword = !process.env.ADMIN_PASSWORD && adminPassword() === DEV_PASSWORD;
  const noPassword = adminPassword() === null;

  return (
    <main className="admin-ui grid min-h-dvh bg-paper lg:grid-cols-[1.1fr_1fr]">
      {/* Photo side */}
      <section className="relative h-56 overflow-hidden bg-espresso sm:h-72 lg:h-auto">
        <Image src="/images/scenes/interior.webp" alt="" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover opacity-70" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/30 to-espresso/40" />
        <div className="relative flex h-full flex-col justify-between p-6 text-cream sm:p-10">
          <Logo className="w-36 text-cream sm:w-44" />
          <div className="hidden max-w-md lg:block">
            <p className="text-sm font-semibold tracking-[0.2em] text-[#e3c27a] uppercase">Quản trị quán</p>
            <p className="mt-3 text-3xl leading-snug font-semibold">Mọi đơn hàng, món và bàn của quán ở một nơi.</p>
            <ul className="mt-6 space-y-2 text-[15px] text-cream/80">
              <li>· Nhận đơn tại bàn và giao hàng theo thời gian thực</li>
              <li>· Cập nhật thực đơn, báo hết món trong một chạm</li>
              <li>· In mã QR gọi món cho từng bàn</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Form side */}
      <section className="flex items-start justify-center px-5 py-10 sm:px-10 lg:items-center">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-semibold tracking-tight">Chào mừng trở lại</h1>
          <p className="mt-2 text-ink-soft">Đăng nhập để vào trang quản trị Phjn Coffee.</p>

          {noPassword ? (
            <p className="mt-8 rounded-2xl border border-line bg-card p-4 text-sm leading-relaxed text-ink-soft">
              Chưa cấu hình mật khẩu. Thêm biến môi trường <code className="font-semibold text-ink">ADMIN_PASSWORD</code> trên máy chủ rồi khởi động lại ứng dụng.
            </p>
          ) : (
            <LoginForm />
          )}

          {usingDevPassword && (
            <p className="mt-6 rounded-2xl bg-paper-2 px-4 py-3 text-xs leading-relaxed text-ink-soft">
              Đang chạy ở chế độ phát triển · mật khẩu mặc định <code className="font-semibold text-ink">{DEV_PASSWORD}</code>. Đặt{" "}
              <code>ADMIN_PASSWORD</code> trong <code>.env.local</code> để đổi.
            </p>
          )}

          <Link href="/" className="mt-10 inline-block text-sm text-ink-soft hover:text-ink">
            ← Về trang khách
          </Link>
        </div>
      </section>
    </main>
  );
}
