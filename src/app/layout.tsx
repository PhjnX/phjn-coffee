import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Bricolage_Grotesque, Playfair_Display } from "next/font/google";
import { MotionProvider } from "@/components/MotionProvider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

/** Body text: a Vietnamese sans that stays crisp at small sizes on phones. */
const body = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

/** Headings: a bold grotesque with a bit of character. */
const heading = Bricolage_Grotesque({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

/** Accent serif: the logo and the one italic word in a heading. */
const accent = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "700"],
  style: ["normal", "italic"],
  variable: "--font-accent",
  display: "swap",
});

/** Admin dashboard face: a clean Vietnamese sans that reads well in numbers and dense lists. */
const admin = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-admin",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Phjn Coffee · Cà phê, trà và bánh",
    template: "%s · Phjn Coffee",
  },
  description: "Đặt cà phê, trà sữa, trà trái cây, nước ép và bánh nướng mỗi ngày của Phjn Coffee. Xem thực đơn và quét mã QR trên bàn để gọi món.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Phjn Coffee",
    images: [{ url: "/images/scenes/croissant-coffee.webp", width: 1200, height: 800, alt: "Cà phê và croissant của Phjn Coffee" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f4ebdf",
};

/** Fonts and motion settings shared by the shop (app/(site)) and the admin (app/admin). */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${body.variable} ${heading.variable} ${accent.variable} ${admin.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
