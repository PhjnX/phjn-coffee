"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { Logo } from "../brand/Logo";

const nav = [
  { href: "/admin", label: "Tổng quan", icon: "M4 13h6V4H4zm10 7h6v-9h-6zM4 20h6v-4H4zm10-11h6V4h-6z" },
  { href: "/admin/don-hang", label: "Đơn hàng", icon: "M6 4h12l1 16H5zM9 8h6M9 12h6M9 16h3" },
  { href: "/admin/thuc-don", label: "Thực đơn", icon: "M7 3v8m-2-8v4a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 0-3 3-3 6s1 4 3 4v8" },
  { href: "/admin/ban", label: "Bàn & QR", icon: "M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 3h2m2 0h2m-6 3h6m-6-6h3" },
];

function Icon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}

/** Admin frame in the shop's look: kraft sidebar with the logo on wide screens, tab bar on phones. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const today = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric", timeZone: "Asia/Ho_Chi_Minh" });

  return (
    <div className="admin-ui min-h-dvh bg-paper lg:pl-64 print:bg-white print:pl-0">
      <aside className="kraft fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line px-5 py-8 lg:flex print:hidden">
        <Link href="/admin" className="mx-auto text-ink transition-opacity hover:opacity-80" aria-label="Quản trị Phjn Coffee">
          <Logo className="w-40" />
        </Link>
        <p className="mt-3 text-center text-[11px] font-semibold tracking-[0.3em] text-caramel uppercase">Quản trị quán</p>

        <nav className="mt-10 space-y-1">
          {nav.map((n) => {
            const on = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${
                  on ? "bg-card text-ink shadow-[0_8px_20px_-14px_rgb(59_46_37/0.6)]" : "text-ink-soft hover:bg-card/50 hover:text-ink"
                }`}
              >
                {on && <span className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-caramel" />}
                <Icon d={n.icon} className={on ? "text-caramel-dark" : ""} />
                <span className="font-display text-[17px]">{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <p className="text-center text-xs text-ink-soft capitalize" suppressHydrationWarning>
            {today}
          </p>
          <div className="flex gap-2">
            <Link href="/" target="_blank" className="flex-1 rounded-full border border-ink/15 py-2 text-center text-xs text-ink-soft transition-colors hover:border-ink/30 hover:text-ink">
              Trang khách ↗
            </Link>
            <form action={logout} className="flex-1">
              <button type="submit" className="w-full rounded-full border border-ink/15 py-2 text-xs text-ink-soft transition-colors hover:border-ink/30 hover:text-ink">
                Đăng xuất
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Phones / tablets: top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper/95 px-4 backdrop-blur lg:hidden print:hidden">
        <Link href="/admin" className="text-ink" aria-label="Quản trị Phjn Coffee">
          <Logo className="h-9 w-auto" />
        </Link>
        <form action={logout}>
          <button type="submit" className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft">
            Đăng xuất
          </button>
        </form>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 pb-28 md:px-6 lg:px-12 lg:pt-12 lg:pb-16 print:max-w-none print:p-0">{children}</main>

      {/* Phones / tablets: bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden print:hidden">
        {nav.map((n) => {
          const on = isActive(n.href);
          return (
            <Link key={n.href} href={n.href} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${on ? "font-semibold text-caramel-dark" : "text-ink-soft"}`}>
              <Icon d={n.icon} />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
