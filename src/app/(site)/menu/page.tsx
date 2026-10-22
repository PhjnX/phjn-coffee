import type { Metadata } from "next";
import { MenuView } from "@/components/MenuView";
import { getMenu } from "@/lib/menu";

export const metadata: Metadata = {
  title: "Thực đơn",
  description: "Cà phê, trà sữa, trà trái cây, nước ép, sinh tố và bánh của Phjn Coffee. Chọn size, mức đường, đá và topping theo ý bạn.",
};

type Props = { searchParams: Promise<{ mon?: string }> };

export default async function MenuPage({ searchParams }: Props) {
  const [menu, { mon }] = await Promise.all([getMenu(), searchParams]);
  const available = menu.products.filter((p) => p.isAvailable).length;
  return (
    <main>
      <header className="kraft border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
          <h1 className="font-display text-4xl md:text-5xl">Thực đơn</h1>
          <p className="mt-2 text-ink-soft">{available} món đang phục vụ · chỉnh size, đường, đá theo ý bạn · giao khoảng 30 phút</p>
        </div>
      </header>
      <MenuView menu={menu} initialProductSlug={mon} />
    </main>
  );
}
