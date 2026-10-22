import type { Metadata } from "next";
import { MenuHero } from "@/components/menu/MenuHero";
import { MenuView } from "@/components/MenuView";
import { getMenu } from "@/lib/menu";

export const metadata: Metadata = {
  title: "Thực đơn",
  description: "Cà phê, trà sữa, trà trái cây, nước ép và bánh nướng của Phjn Coffee. Chỉnh size, đường, đá theo ý bạn.",
};

type Props = { searchParams: Promise<{ mon?: string }> };

export default async function MenuPage({ searchParams }: Props) {
  const [menu, { mon }] = await Promise.all([getMenu(), searchParams]);
  const available = menu.products.filter((p) => p.isAvailable).length;
  return (
    <main>
      <MenuHero available={available} />
      <MenuView menu={menu} initialProductSlug={mon} />
    </main>
  );
}
