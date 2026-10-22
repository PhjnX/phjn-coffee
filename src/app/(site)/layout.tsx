import { CartDrawer } from "@/components/CartDrawer";
import { ContentFrame } from "@/components/ContentFrame";
import { Footer } from "@/components/Footer";
import { PageLoader } from "@/components/PageLoader";
import { SiteNav } from "@/components/SiteNav";
import { TableFromUrl } from "@/components/TableFromUrl";
import { getMenu } from "@/lib/menu";

/** The customer-facing shop: loader, navigation, footer and cart around every page. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { categories } = await getMenu();
  return (
    <>
      <PageLoader />
      <SiteNav categories={[...categories].sort((a, b) => a.sort - b.sort)} />
      <ContentFrame>
        <div className="flex-1">{children}</div>
        <Footer />
      </ContentFrame>
      <CartDrawer />
      <TableFromUrl />
    </>
  );
}
