import Image from "next/image";
import { Reveal } from "../home/Reveal";

/**
 * Menu page banner: a darkened photo with a small kicker, the title and the count, ending in a
 * softly torn paper edge; then a short quote in italic with a faint phin sketch behind it.
 */
export function MenuHero({ available }: { available: number }) {
  return (
    <>
      <header className="relative isolate overflow-hidden bg-espresso">
        <Image src="/images/scenes/croissant-coffee.webp" alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-50" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-espresso/40 via-espresso/10 to-espresso/55" />
        <div className="flex min-h-[260px] flex-col items-center justify-center px-4 pt-8 pb-16 text-center md:min-h-[400px] md:pb-24">
          <p className="text-xs font-semibold tracking-[0.3em] text-[#e0c39f] uppercase">Phjn Coffee · Sài Gòn</p>
          <h1 className="mt-3 font-display text-[52px] leading-none font-medium text-white md:text-8xl">Thực đơn</h1>
          <p className="mt-4 text-[15px] text-white/85">{available} món đang phục vụ hôm nay</p>
        </div>
        <TornEdge />
      </header>

      <section className="relative overflow-hidden px-6 pt-6 pb-2 text-center md:pt-12 md:pb-6">
        <PhinSketch className="pointer-events-none absolute top-0 -right-12 h-44 text-ink opacity-[0.08] md:top-0 md:right-[10%] md:h-64" />
        <Reveal>
          <blockquote className="relative mx-auto max-w-2xl font-display text-[22px] leading-snug text-ink italic md:text-[30px]">
            “Ly đầu để tỉnh táo, ly thứ hai để trò chuyện, ly thứ ba để ở lại lâu hơn một chút.”
          </blockquote>
          <p className="relative mt-3 text-sm text-ink-soft">Chỉnh size, đường, đá theo ý bạn. Quét mã QR trên bàn để gọi món.</p>
        </Reveal>
      </section>
    </>
  );
}

/** A ragged line across the width: small irregular steps from a fixed seed, so it renders the same every time. */
function ragged(base: number, amp: number, step: number, seed: number): string {
  let s = seed;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  let d = `M0 60 V${base}`;
  for (let x = 0; x <= 1440; x += step * (0.6 + rand() * 0.8)) d += ` L${Math.round(x)} ${(base + (rand() - 0.5) * amp).toFixed(1)}`;
  return `${d} L1440 ${base} V60 Z`;
}

const FIBRES = ragged(30, 9, 9, 11);
const EDGE = ragged(36, 6, 6, 29);

/** Torn paper along the bottom of the banner: a fainter fibre layer under the cream edge. */
function TornEdge() {
  return (
    <svg aria-hidden viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute inset-x-0 -bottom-px h-8 w-full text-paper md:h-12">
      <path fill="currentColor" opacity="0.5" d={FIBRES} />
      <path fill="currentColor" d={EDGE} />
    </svg>
  );
}

/** A loose line sketch of a Vietnamese phin filter on a glass. */
function PhinSketch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 220" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M58 18c4-6 40-6 44 0" />
      <path d="M54 22c2-4 50-4 52 0l-2 6H56z" />
      <path d="M78 10c1-3 4-3 5 0" />
      <path d="M57 30 61 78h38l4-48" />
      <path d="M59 40h42M60 52h40" strokeWidth="0.9" />
      <path d="M36 80c10-5 78-5 88 0 0 4-88 4-88 0Z" />
      <path d="M80 88v8M80 102v4" strokeWidth="1.2" />
      <path d="M50 92 56 206c1 6 47 6 48 0l6-114" />
      <path d="M53 132c18 4 36 4 54 0" strokeWidth="1" />
      <path d="M55 150c6 10 18 18 24 40M70 142c4 14 20 26 22 56" strokeWidth="0.8" />
      <path d="M48 92c12-3 52-3 64 0" />
      <path d="M118 160 140 214" strokeWidth="1.2" />
      <path d="M114 148c-4 4-2 12 5 13 6 0 6-9 1-13-2-1-4-1-6 0Z" strokeWidth="1.2" />
    </svg>
  );
}
