import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lexend, Lora, Montserrat, Playfair_Display } from "next/font/google";
import Image from "next/image";

/**
 * Temporary page for choosing type and text colour: the same sample block set five ways.
 * Not linked from the site; remove once a pairing is picked.
 */

export const metadata: Metadata = { title: "Chọn font", robots: { index: false } };

const beVietnam = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], display: "swap", weight: ["400", "500", "700"] });
const lora = Lora({ subsets: ["latin", "vietnamese"], display: "swap", weight: ["500", "600", "700"] });
const playfair = Playfair_Display({ subsets: ["latin", "vietnamese"], display: "swap", weight: ["500", "600", "700"] });
const lexend = Lexend({ subsets: ["latin", "vietnamese"], display: "swap", weight: ["400", "500", "600"] });
const montserrat = Montserrat({ subsets: ["latin", "vietnamese"], display: "swap", weight: ["500", "700", "800"] });

const options = [
  {
    n: 1,
    name: "Hiện đại, gọn",
    note: "Be Vietnam Pro cho cả tiêu đề và chữ thường. Chữ gần đen, nhấn be.",
    head: beVietnam.className,
    headWeight: 700,
    body: beVietnam.className,
    ink: "#1d1b19",
    soft: "#55504b",
  },
  {
    n: 2,
    name: "Cổ điển, ấm",
    note: "Tiêu đề Lora (có chân), chữ thường Be Vietnam Pro. Chữ nâu rất đậm.",
    head: lora.className,
    headWeight: 600,
    body: beVietnam.className,
    ink: "#2a1f19",
    soft: "#5b4d44",
  },
  {
    n: 3,
    name: "Sang, thanh lịch",
    note: "Tiêu đề Playfair Display, chữ thường Be Vietnam Pro. Chữ gần đen.",
    head: playfair.className,
    headWeight: 600,
    body: beVietnam.className,
    ink: "#1f1d1b",
    soft: "#56514c",
  },
  {
    n: 4,
    name: "Tròn, thân thiện",
    note: "Lexend cho cả tiêu đề và chữ thường, nét tròn dễ đọc. Chữ nâu đậm.",
    head: lexend.className,
    headWeight: 600,
    body: lexend.className,
    ink: "#33241b",
    soft: "#5f5047",
  },
  {
    n: 5,
    name: "Đang dùng (để so)",
    note: "Montserrat tiêu đề, Be Vietnam Pro chữ thường. Chữ nâu.",
    head: montserrat.className,
    headWeight: 800,
    body: beVietnam.className,
    ink: "#3a1f16",
    soft: "#5e4c43",
  },
];

export default function ChooseFont() {
  return (
    <main className="min-h-dvh bg-[#f1efec] px-4 py-10 md:px-10">
      <h1 className={`${beVietnam.className} mx-auto max-w-5xl text-2xl font-bold text-[#1d1b19]`}>Chọn font và màu chữ</h1>
      <p className={`${beVietnam.className} mx-auto mt-2 max-w-5xl text-[15px] text-[#55504b]`}>
        Cùng một nội dung, năm cách trình bày. Bạn xem trên điện thoại rồi báo mình số bạn thích nhất.
      </p>

      <div className="mx-auto mt-8 grid max-w-5xl gap-5 md:grid-cols-2">
        {options.map((o) => (
          <section key={o.n} className={`${o.body} rounded-3xl bg-white p-5 md:p-7`} style={{ color: o.ink }}>
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-[#d39a62] text-sm font-bold text-[#1d1b19]">{o.n}</span>
              <div>
                <p className="text-sm font-bold">{o.name}</p>
                <p className="text-xs" style={{ color: o.soft }}>
                  {o.note}
                </p>
              </div>
            </div>

            <p className="mt-7 text-xs font-semibold tracking-[0.18em] text-[#9a6331] uppercase">Được yêu thích</p>
            <h2 className={`${o.head} mt-2 text-[32px] leading-tight`} style={{ fontWeight: o.headWeight }}>
              Món khách hay quay lại
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: o.soft }}>
              Một quán nhỏ cho cả nhóm bạn: người thích cà phê đậm, người chỉ uống trà trái cây, người ghé vì chiếc croissant vừa ra lò.
            </p>

            <div className="mt-5 flex gap-4 rounded-2xl border border-black/10 p-3">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                <Image src="/images/photos/ca-phe-sua-da.webp" alt="" fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className={`${o.head} text-lg leading-snug`} style={{ fontWeight: o.headWeight }}>
                  Cà phê sữa đá
                </p>
                <p className="mt-0.5 text-[13px] leading-snug" style={{ color: o.soft }}>
                  Phin truyền thống với sữa đặc. Ly quen của người Sài Gòn.
                </p>
                <p className="mt-1.5 font-bold">32.000đ</p>
              </div>
            </div>

            <span className="mt-5 inline-flex h-11 items-center rounded-full bg-[#3a1f16] px-6 text-[13px] font-semibold text-white">Xem thực đơn</span>
          </section>
        ))}
      </div>
    </main>
  );
}
