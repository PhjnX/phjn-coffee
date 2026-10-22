import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./Reveal";

const hours = [
  ["Thứ 2 – Thứ 6", "7:00 – 22:00"],
  ["Thứ 7 – Chủ nhật", "7:00 – 23:00"],
] as const;

/**
 * Visit band on soft cream stripes: the shop's interior in an arch, then opening hours and how
 * ordering at the table works.
 */
export function Visit() {
  return (
    <section
      id="cua-hang"
      className="scroll-mt-16 py-14 md:py-24"
      style={{ background: "repeating-linear-gradient(90deg, var(--card) 0 28px, var(--paper) 28px 56px)" }}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 md:grid-cols-2 md:gap-16 md:px-10">
        <Reveal from="left" className="mx-auto w-[72%] max-w-[360px] md:order-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[28px] border-[6px] border-card shadow-[0_30px_50px_-26px_rgb(42_31_25/0.6)]">
            <Image src="/images/scenes/interior.webp" alt="Quầy pha chế và kệ ly trong quán" fill sizes="(min-width: 768px) 360px, 72vw" className="object-cover" />
          </div>
        </Reveal>

        <Reveal from="right" className="rounded-[28px] bg-card/90 p-6 text-center md:p-10 md:text-left">
          <span className="inline-block rounded-full border border-ink/25 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase">Sắp khai trương</span>
          <h2 className="mt-4 font-display text-[30px] leading-tight md:text-[44px]">
            Ghé Phjn, gọi món <em className="font-medium text-caramel-dark">ngay tại bàn</em>
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            Quán đầu tiên đang được hoàn thiện ở Sài Gòn. Mỗi bàn có một mã QR riêng: quét, chọn món, chỉnh từng ly theo ý, nhân viên mang ra tận bàn.
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-left">
            {hours.map(([d, h]) => (
              <div key={d} className="rounded-2xl bg-paper-2 px-4 py-3">
                <dt className="text-xs text-ink-soft">{d}</dt>
                <dd className="mt-0.5 font-bold tabular-nums">{h}</dd>
              </div>
            ))}
          </dl>
          <Link
            href="/menu"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-espresso px-7 text-sm font-semibold text-cream transition-colors hover:bg-ink"
          >
            Xem thực đơn <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
