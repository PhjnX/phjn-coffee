import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Dancing_Script, Open_Sans, Oswald, Trirong } from "next/font/google";
import { MotionProvider } from "@/components/MotionProvider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const body = Open_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "600"],
  variable: "--font-body",
  display: "swap",
});

const heading = Trirong({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
  variable: "--font-heading",
  display: "swap",
});

/** Menu board: tall condensed capitals for item names, prices and big titles. */
const condensed = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-oswald",
  display: "swap",
});

/** A handwritten line over the menu banner. */
const script = Dancing_Script({
  subsets: ["latin", "vietnamese"],
  weight: ["600"],
  variable: "--font-dancing",
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
  themeColor: "#e9dcc8",
};

/** Fonts and motion settings shared by the shop (app/(site)) and the admin (app/admin). */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${body.variable} ${heading.variable} ${condensed.variable} ${script.variable} ${admin.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
