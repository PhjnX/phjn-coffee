import { Featured } from "@/components/home/Featured";
import { HeroSlider } from "@/components/home/HeroSlider";
import { MenuList } from "@/components/home/MenuList";
import { Mosaic } from "@/components/home/Mosaic";
import { QuoteBand } from "@/components/home/QuoteBand";
import { SectionDots } from "@/components/home/SectionDots";
import { Welcome } from "@/components/home/Welcome";
import { getMenu } from "@/lib/menu";

export default async function Home() {
  const menu = await getMenu();
  const categories = [...menu.categories].sort((a, b) => a.sort - b.sort);
  const available = menu.products.filter((p) => p.isAvailable && (p.photo || p.image));
  // Badged items first, then the rest, so the carousel always has enough to scroll.
  const featured = [...available.filter((p) => p.badge), ...available.filter((p) => !p.badge)].slice(0, 14);

  return (
    <main>
      <HeroSlider />
      <Welcome />
      <MenuList categories={categories} products={menu.products} />
      <Featured products={featured} />
      <QuoteBand />
      <Mosaic />
      <SectionDots />
    </main>
  );
}
