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
      <header className="bg-espresso text-cream">
        <div className="mx-auto max-w-6xl px-4 py-9 md:px-8 md:py-14">
          <p className="text-[13px] font-semibold tracking-[0.18em] text-[#f0a46f] uppercase">{available} món đang phục vụ</p>
          <h1 className="mt-2 font-display text-[44px] leading-none md:text-6xl">
            Thực đơn <em className="text-[#f0a46f]">Phjn</em>
          </h1>
          <p className="mt-3 max-w-lg text-cream/80">Chỉnh size, đường, đá theo ý bạn. Quét mã QR trên bàn để gọi món.</p>
        </div>
      </header>
      <MenuView menu={menu} initialProductSlug={mon} />
    </main>
  );
}
