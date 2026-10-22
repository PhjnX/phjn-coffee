import Image from "next/image";

/**
 * Menu page banner, café-menu style: a darkened photo with a handwritten line over a tall
 * condensed title, ending in a torn paper edge; then a quote in capitals with a faint phin
 * sketch behind it.
 */
export function MenuHero({ available }: { available: number }) {
  return (
    <>
      <header className="relative isolate overflow-hidden bg-espresso">
        <Image src="/images/scenes/croissant-coffee.webp" alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-55" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-espresso/50 via-espresso/20 to-espresso/60" />
        <div className="flex min-h-[300px] flex-col items-center justify-center px-4 pt-10 pb-20 text-center md:min-h-[440px] md:pb-28">
          <p className="font-script text-4xl text-caramel md:text-6xl">Mời bạn xem</p>
          <h1 className="-mt-1 font-condensed text-[68px] leading-none font-medium tracking-[0.02em] text-white uppercase md:-mt-2 md:text-[128px]">
            Thực đơn
          </h1>
          <p className="mt-4 text-sm tracking-[0.2em] text-white/85 uppercase">{available} món đang phục vụ</p>
        </div>
        <TornEdge />
      </header>

      <section className="relative overflow-hidden px-6 pt-8 pb-4 text-center md:pt-14 md:pb-8">
        <PhinSketch className="pointer-events-none absolute top-0 -right-10 h-48 text-ink opacity-[0.09] md:top-2 md:right-[8%] md:h-72" />
        <blockquote className="relative mx-auto max-w-3xl font-condensed text-[22px] leading-snug font-medium tracking-[0.01em] uppercase md:text-[34px]">
          “Ly đầu để tỉnh táo, ly thứ hai để trò chuyện, ly thứ ba để ở lại lâu hơn một chút.”
        </blockquote>
        <p className="relative mt-3 text-sm text-ink-soft">Chỉnh size, đường, đá theo ý bạn. Quét mã QR trên bàn để gọi món.</p>
      </section>
    </>
  );
}

/** Torn paper along the bottom of the banner: a ragged cream layer over a fainter fibre layer. */
function TornEdge() {
  return (
    <svg aria-hidden viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute inset-x-0 -bottom-px h-10 w-full text-paper md:h-16">
      <path
        fill="currentColor"
        opacity="0.55"
        d="M0 80 V34 L0 23 L21 28 L47 30 L80 35 L110 41 L132 39 L147 38 L184 41 L210 43 L240 36 L276 31 L311 30 L332 32 L369 35 L405 24 L433 34 L451 45 L473 38 L499 27 L519 31 L541 35 L560 43 L595 37 L622 34 L659 32 L679 36 L700 32 L736 25 L751 32 L766 45 L796 26 L824 26 L860 43 L897 40 L910 18 L939 28 L965 38 L1001 28 L1037 26 L1050 43 L1087 23 L1105 44 L1136 29 L1154 52 L1185 39 L1199 25 L1216 38 L1229 42 L1268 44 L1292 28 L1328 32 L1352 43 L1374 37 L1396 39 L1414 30 L1440 34 V80 Z"
      />
      <path
        fill="currentColor"
        d="M0 80 V44 L0 46 L26 39 L37 44 L60 51 L72 43 L93 44 L111 48 L134 36 L153 39 L167 40 L183 37 L207 51 L229 63 L248 48 L258 33 L269 36 L295 39 L307 47 L324 52 L346 48 L362 37 L386 52 L411 44 L424 46 L434 40 L453 44 L464 43 L473 36 L484 40 L507 48 L531 51 L552 45 L568 44 L587 48 L608 48 L632 52 L650 51 L665 37 L690 47 L716 49 L730 65 L753 46 L772 43 L791 50 L812 43 L824 45 L850 49 L871 50 L897 36 L913 36 L938 39 L964 47 L975 59 L995 48 L1010 47 L1028 45 L1050 48 L1061 37 L1074 45 L1087 46 L1111 40 L1121 47 L1144 47 L1155 51 L1179 43 L1202 48 L1226 39 L1238 38 L1264 36 L1290 50 L1304 44 L1323 38 L1341 33 L1351 46 L1375 48 L1397 42 L1423 48 L1440 44 V80 Z"
      />
    </svg>
  );
}

/** A loose line sketch of a Vietnamese phin filter on a glass, drawn with uneven strokes. */
function PhinSketch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 220" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {/* lid */}
      <path d="M58 18c4-6 40-6 44 0" />
      <path d="M54 22c2-4 50-4 52 0l-2 6H56z" />
      <path d="M78 10c1-3 4-3 5 0" />
      {/* chamber */}
      <path d="M57 30 61 78h38l4-48" />
      <path d="M59 40h42M60 52h40" strokeWidth="0.9" />
      {/* plate */}
      <path d="M36 80c10-5 78-5 88 0 0 4-88 4-88 0Z" />
      {/* drip */}
      <path d="M80 88v8M80 102v4" strokeWidth="1.2" />
      {/* glass */}
      <path d="M50 92 56 206c1 6 47 6 48 0l6-114" />
      <path d="M53 132c18 4 36 4 54 0" strokeWidth="1" />
      <path d="M55 150c6 10 18 18 24 40M70 142c4 14 20 26 22 56" strokeWidth="0.8" />
      <path d="M48 92c12-3 52-3 64 0" />
      {/* spoon */}
      <path d="M118 160 140 214" strokeWidth="1.2" />
      <path d="M114 148c-4 4-2 12 5 13 6 0 6-9 1-13-2-1-4-1-6 0Z" strokeWidth="1.2" />
    </svg>
  );
}
