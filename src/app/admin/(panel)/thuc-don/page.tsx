import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, primaryButton } from "@/components/admin/AdminUI";
import { AvailabilityToggle } from "@/components/admin/AvailabilityToggle";
import { ProductPhoto } from "@/components/ProductImage";
import { formatVND } from "@/lib/format";
import { store } from "@/lib/server/store";

export const metadata: Metadata = { title: "Thực đơn" };
export const dynamic = "force-dynamic";

const badgeText = { bestseller: "Bán chạy", new: "Mới", signature: "Đặc biệt" } as const;

export default async function AdminMenuPage() {
  const menu = await store.getMenu();
  const categories = [...menu.categories].sort((a, b) => a.sort - b.sort);
  const soldOut = menu.products.filter((p) => !p.isAvailable).length;

  return (
    <div>
      <PageHeader
        kicker="Quản lý món"
        title="Thực đơn"
        subtitle={`${menu.products.length} món · ${soldOut} món tạm hết · bật tắt công tắc để báo hết món, trang khách đổi ngay.`}
        actions={
          <Link href="/admin/thuc-don/moi" className={primaryButton}>
            + Thêm món
          </Link>
        }
      />

      <nav aria-label="Danh mục" className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {categories.map((c) => (
          <a
            key={c.id}
            href={`#dm-${c.id}`}
            className="shrink-0 rounded-full border border-line bg-card px-4 py-2 text-sm whitespace-nowrap text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
          >
            {c.name} <span className="opacity-60">{menu.products.filter((p) => p.categoryId === c.id).length}</span>
          </a>
        ))}
      </nav>

      {categories.map((c) => {
        const products = menu.products.filter((p) => p.categoryId === c.id);
        return (
          <section key={c.id} id={`dm-${c.id}`} className="mt-10 scroll-mt-20">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-2xl">{c.name}</h2>
              <span className="text-sm text-ink-soft">{products.length} món</span>
            </div>
            <ul className="grid gap-3 md:grid-cols-2">
              {products.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-4 rounded-[22px] border border-line bg-card p-3 pr-4 shadow-[0_18px_40px_-34px_rgb(59_46_37/0.6)]"
                >
                  <ProductPhoto item={p} className={`size-16 shrink-0 rounded-2xl ${p.isAvailable ? "" : "opacity-50 grayscale"}`} sizes="64px" />
                  <Link href={`/admin/thuc-don/${p.id}`} className="group min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-display text-lg group-hover:text-caramel-dark">{p.name}</span>
                      {p.badge && <span className="shrink-0 rounded-full bg-paper-2 px-2 py-0.5 text-[10px] font-semibold text-caramel-dark">{badgeText[p.badge]}</span>}
                    </span>
                    <span className="block text-sm text-ink-soft tabular-nums">
                      {formatVND(p.basePrice)} · <span className="group-hover:underline">Sửa</span>
                    </span>
                  </Link>
                  <AvailabilityToggle id={p.id} available={p.isAvailable} />
                </li>
              ))}
              {products.length === 0 && <li className="rounded-[22px] border border-dashed border-line px-4 py-6 text-sm text-ink-soft">Chưa có món nào.</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
