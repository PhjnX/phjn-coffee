"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

type Cell =
  | { kind: "photo"; src: string; alt: string }
  | { kind: "hours" }
  | { kind: "delivery" }
  | { kind: "stores" };

const cells: Cell[] = [
  {
    kind: "photo",
    src: "/images/scenes/interior.webp",
    alt: "Quầy pha chế và kệ ly trong quán",
  },
  { kind: "hours" },
  {
    kind: "photo",
    src: "/images/scenes/croissant-coffee.webp",
    alt: "Croissant và tách cà phê trên khăn trắng",
  },
  {
    kind: "photo",
    src: "/images/scenes/barista.webp",
    alt: "Barista rót sữa vào ly cappuccino",
  },
  { kind: "delivery" },
  {
    kind: "photo",
    src: "/images/scenes/iced-coffees.webp",
    alt: "Hai ly cà phê sữa đá trên đế gỗ",
  },
  {
    kind: "photo",
    src: "/images/scenes/pastry.webp",
    alt: "Croissant hạnh nhân rắc đường bột",
  },
  { kind: "stores" },
];

/** Four-across grid of square tiles: photos that zoom on hover, alternating with cream info cards. */
export function Mosaic() {
  return (
    <section
      id="cua-hang"
      className="scroll-mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cells.map((cell, i) => (
        <motion.div
          key={i}
          className="relative aspect-square overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: (i % 4) * 0.1 }}
        >
          {cell.kind === "photo" ? (
            <Image
              src={cell.src}
              alt={cell.alt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-110"
            />
          ) : (
            <InfoTile>
              {cell.kind === "hours" && (
                <>
                  <TileTitle>Giờ mở cửa</TileTitle>
                  <dl className="mt-5 space-y-3 text-sm text-ink-soft">
                    {[
                      ["Thứ 2 – Thứ 6", "7:00 – 22:00"],
                      ["Thứ 7 – Chủ nhật", "7:00 – 23:00"],
                      ["Lễ, Tết", "8:00 – 21:00"],
                    ].map(([d, h]) => (
                      <div key={d}>
                        <dt className="text-[11px] font-semibold tracking-[0.18em] text-caramel uppercase">
                          {d}
                        </dt>
                        <dd className="tracking-wider">{h}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}
              {cell.kind === "delivery" && (
                <>
                  <TileTitle>Gọi món tại bàn</TileTitle>
                  <p className="mt-5 max-w-[15rem] text-sm leading-relaxed text-ink-soft">
                    Quét mã QR trên bàn, chọn món và chỉnh từng ly theo ý. Nhân
                    viên mang ra tận bàn.
                  </p>
                  <Link
                    href="/menu"
                    className="mt-6 rounded-full border border-ink/40 px-7 py-3 text-xs font-medium tracking-[0.18em] uppercase transition-colors hover:border-caramel hover:bg-caramel hover:text-cream"
                  >
                    Xem thực đơn
                  </Link>
                </>
              )}
              {cell.kind === "stores" && (
                <>
                  <span className="rounded-full border border-caramel/50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-caramel uppercase">
                    Sắp khai trương
                  </span>
                  <div className="mt-4">
                    <TileTitle>Cửa hàng</TileTitle>
                  </div>
                  <p className="mt-4 max-w-[15rem] text-sm leading-relaxed text-ink-soft">
                    Quán đầu tiên đang được hoàn thiện ở Sài Gòn. Mỗi bàn sẽ có
                    mã QR riêng để bạn gọi món ngay tại chỗ.
                  </p>
                </>
              )}
            </InfoTile>
          )}
        </motion.div>
      ))}
    </section>
  );
}

function InfoTile({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex size-full flex-col items-center justify-center bg-paper-2 p-6 text-center">
      {/* faint coffee-bean line art behind the text */}
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="absolute inset-0 m-auto size-[70%] text-caramel opacity-[0.12]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <ellipse
          cx="80"
          cy="100"
          rx="38"
          ry="58"
          transform="rotate(25 80 100)"
        />
        <path d="M58 52c26 26 6 62 46 96" />
        <ellipse
          cx="138"
          cy="82"
          rx="26"
          ry="40"
          transform="rotate(-30 138 82)"
        />
        <path d="M124 50c18 18 0 44 28 64" />
      </svg>
      <div className="relative flex flex-col items-center">{children}</div>
    </div>
  );
}

function TileTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-3xl font-medium whitespace-nowrap lg:text-2xl xl:text-3xl">
      {children}
    </h3>
  );
}
