import { HeroSlider } from "@/components/home/HeroSlider";
import { Popular } from "@/components/home/Popular";
import { Process } from "@/components/home/Process";
import { SectionDots } from "@/components/home/SectionDots";
import { Spotlight } from "@/components/home/Spotlight";
import { Visit } from "@/components/home/Visit";
import { getMenu } from "@/lib/menu";

export default async function Home() {
  const menu = await getMenu();
  const categories = [...menu.categories].sort((a, b) => a.sort - b.sort);
  // Badged items first, then the rest; only items with a cut-out, since the cards stand them on a block.
  const withCutout = menu.products.filter((p) => p.isAvailable && p.image);
  const popular = [...withCutout.filter((p) => p.badge), ...withCutout.filter((p) => !p.badge)].slice(0, 12);

  return (
    <main>
      <HeroSlider />
      <Spotlight categories={categories} products={menu.products} groups={menu.optionGroups} />
      <Process />
      <Popular products={popular} />
      <Visit />
      <SectionDots />
    </main>
  );
}
