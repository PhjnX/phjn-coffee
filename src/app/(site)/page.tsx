import { BakeryCard } from "@/components/home/BakeryCard";
import { Categories } from "@/components/home/Categories";
import { Favourites } from "@/components/home/Favourites";
import { HeroSlider } from "@/components/home/HeroSlider";
import { Highlights } from "@/components/home/Highlights";
import { SectionDots } from "@/components/home/SectionDots";
import { Spotlight } from "@/components/home/Spotlight";
import { Visit } from "@/components/home/Visit";
import { getMenu } from "@/lib/menu";

export default async function Home() {
  const menu = await getMenu();
  const categories = [...menu.categories].sort((a, b) => a.sort - b.sort);
  // Badged items first, then the rest; only items with a real photo.
  const withPhoto = menu.products.filter((p) => p.isAvailable && p.photo);
  const favourites = [...withPhoto.filter((p) => p.badge), ...withPhoto.filter((p) => !p.badge)].slice(0, 8);

  return (
    <main>
      <HeroSlider />
      <Highlights />
      <Spotlight categories={categories} products={menu.products} groups={menu.optionGroups} />
      <BakeryCard />
      <Favourites products={favourites} />
      <Categories categories={categories} products={menu.products} />
      <Visit />
      <SectionDots />
    </main>
  );
}
