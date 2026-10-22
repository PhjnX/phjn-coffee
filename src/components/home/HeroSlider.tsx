"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useHeroScene } from "@/lib/hero-scene";

/** `video` is a 9-second 720p loop; `poster` shows until it can play. */
type Slide = {
  video: string;
  poster: string;
  kicker: string;
  title: string;
  text: string;
  cta: { href: string; label: string };
};

const slides: Slide[] = [
  {
    video: "/videos/latte-art.mp4",
    poster: "/videos/latte-art.webp",
    kicker: "Cà phê",
    title: "Pha bằng tay, từng ly một",
    text: "Arabica Cầu Đất, sữa tươi đánh mịn, latte art vẽ ngay trước mặt bạn.",
    cta: { href: "/menu#cat-ca-phe", label: "Xem cà phê" },
  },
  {
    video: "/videos/tea.mp4",
    poster: "/videos/tea.webp",
    kicker: "Trà",
    title: "Trà ủ mới mỗi sáng",
    text: "Ô long, hồng trà, trà xanh nhài. Thêm trái cây tươi hoặc sữa, tuỳ bạn.",
    cta: { href: "/menu#cat-tra", label: "Xem trà" },
  },
  {
    video: "/videos/bakery.mp4",
    poster: "/videos/bakery.webp",
    kicker: "Bánh",
    title: "Ra lò lúc 6 giờ sáng",
    text: "Croissant bơ Pháp, bánh ngàn lớp, tiramisu và cookie nướng tại bếp của quán.",
    cta: { href: "/menu#cat-banh", label: "Xem bánh" },
  },
];

/** Beans scattered on the left of the paper, as in a flat-lay. Positions in % of the paper. */
const beans = [
  { x: 4, y: 40, w: 92, r: -20, b: 1 },
  { x: 12, y: 52, w: 84, r: 35, b: 2 },
  { x: 2, y: 60, w: 88, r: 70, b: 3 },
  { x: 14, y: 36, w: 70, r: 120, b: 4 },
  { x: 24, y: 62, w: 66, r: -60, b: 1 },
  { x: 1, y: 82, w: 58, r: 20, b: 2 },
];

const SLIDE_MS = 8000;
const SCENE_MS = 1300;
const ease = [0.22, 1, 0.36, 1] as const;
const curtain = [0.76, 0, 0.24, 1] as const;

/**
 * Two-scene hero. It opens on a sheet of kraft paper with the name, beans and a cup. One scroll
 * (wheel, swipe, arrow key or the "scroll to explore" cue) plays a scene change: the paper lifts
 * like a curtain, beans and cup slide apart, the video banner sharpens and the sidebar folds into
 * the top bar. From there the page scrolls normally; scrolling up at the very top plays it back.
 */
export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const scene = useHeroScene((s) => s.scene);
  const setScene = useHeroScene((s) => s.setScene);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const isVideo = scene === "video";
  const t = (d: number) => (reduce ? 0 : d);

  // Start on the paper unless the page was opened part-way down (reload, #anchor).
  useEffect(() => {
    setScene(window.scrollY > 10 ? "video" : "intro");
    return () => setScene("intro");
  }, [setScene]);

  // Turn scroll gestures at the top of the page into scene changes.
  useEffect(() => {
    let locked = false;
    let touchY: number | null = null;
    // Once a swipe has switched the scene, swallow the rest of that same swipe so the page doesn't scroll on.
    let swipeUsed = false;
    const atTop = () => window.scrollY <= 2;
    const current = () => useHeroScene.getState().scene;
    const go = (next: "intro" | "video") => {
      if (locked || current() === next) return;
      locked = true;
      setScene(next);
      window.setTimeout(() => (locked = false), SCENE_MS);
    };
    const onWheel = (e: WheelEvent) => {
      if (!atTop() && current() === "video") return;
      if (locked) return e.preventDefault();
      if (current() === "intro" && e.deltaY > 0) {
        e.preventDefault();
        go("video");
      } else if (current() === "video" && e.deltaY < 0) {
        e.preventDefault();
        go("intro");
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
      swipeUsed = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY === null) return;
      const dy = touchY - e.touches[0].clientY;
      if (swipeUsed || (locked && atTop())) {
        e.preventDefault();
        return;
      }
      if (current() === "intro" && dy > 0) {
        e.preventDefault();
        if (dy > 24) {
          swipeUsed = true;
          go("video");
        }
      } else if (current() === "video" && atTop() && dy < -24) {
        e.preventDefault();
        swipeUsed = true;
        go("intro");
      }
    };
    const onKey = (e: KeyboardEvent) => {
      const down = ["ArrowDown", "PageDown", " "].includes(e.key);
      const up = ["ArrowUp", "PageUp"].includes(e.key);
      if (current() === "intro" && down) {
        e.preventDefault();
        go("video");
      } else if (current() === "video" && up && atTop()) {
        e.preventDefault();
        go("intro");
      }
    };
    // Scrollbar drags and anchor jumps skip the gesture, so follow the page position too.
    const onScroll = () => {
      if (current() === "intro" && window.scrollY > 10) setScene("video");
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [setScene]);

  // Slides advance only while the video scene is showing.
  useEffect(() => {
    if (reduce || !isVideo) return;
    const timer = window.setTimeout(
      () => setIndex((i) => (i + 1) % slides.length),
      SLIDE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [index, reduce, isVideo]);

  // Slides whose video may download. The first starts once the page itself has loaded; the others
  // follow one at a time, so the next slide is ready before it is shown.
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    const start = () => setLoaded((s) => new Set(s).add(0));
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  useEffect(() => {
    if (!isVideo) return;
    const next = (index + 1) % slides.length;
    setLoaded((s) =>
      s.has(index) && s.has(next) ? s : new Set(s).add(index).add(next),
    );
  }, [index, isVideo]);

  // The current video already plays behind the paper, so it is running (not starting up) when the
  // curtain lifts. Changing slide restarts it from the beginning.
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === index && !reduce && loaded.has(i)) v.play().catch(() => {});
      else v.pause();
    });
  }, [index, reduce, loaded]);

  const shown = useRef(index);
  useEffect(() => {
    if (shown.current === index) return;
    shown.current = index;
    const v = videos.current[index];
    if (v) v.currentTime = 0;
  }, [index]);

  const slide = slides[index];
  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + slides.length) % slides.length);

  return (
    <section
      id="top"
      aria-label="Giới thiệu"
      className="relative h-[calc(100svh-4rem)] min-h-[520px] overflow-hidden bg-espresso lg:h-dvh"
    >
      {/* Video layer. Only transform and opacity animate here: a blur over full-screen video is
          too heavy for phones and made the scene change stutter. */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        initial={false}
        animate={{ scale: isVideo ? 1 : 1.18 }}
        transition={{ duration: t(1.5), ease }}
      >
        {slides.map((s, i) => (
          <motion.video
            key={s.video}
            ref={(el) => {
              videos.current[i] = el;
            }}
            aria-hidden
            className="absolute inset-0 size-full object-cover"
            src={loaded.has(i) ? s.video : undefined}
            poster={s.poster}
            muted
            loop
            playsInline
            preload={loaded.has(i) ? "auto" : "none"}
            initial={false}
            animate={{ opacity: i === index ? 1 : 0 }}
            transition={{ duration: t(1.2) }}
          />
        ))}
      </motion.div>
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-espresso"
        initial={false}
        animate={{ opacity: isVideo ? 0.32 : 0.7 }}
        transition={{ duration: t(1.4), ease }}
      />

      {/* Captions and slide controls */}
      <motion.div
        className="absolute inset-0 text-white"
        initial={false}
        animate={{ opacity: isVideo ? 1 : 0, y: isVideo ? 0 : 40 }}
        transition={{ duration: t(0.9), delay: isVideo ? t(0.7) : 0, ease }}
        style={{ pointerEvents: isVideo ? "auto" : "none" }}
        inert={!isVideo}
      >
        <div className="grid size-full place-items-center px-14 text-center md:px-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: t(0.7), ease }}
              className="flex max-w-3xl flex-col items-center"
            >
              <h2 className="font-display text-4xl leading-tight md:text-6xl">
                {slide.title}
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 md:text-lg">
                {slide.text}
              </p>
              <Link
                href={slide.cta.href}
                className="mt-9 inline-flex h-12 items-center rounded-full bg-caramel px-8 text-[13px] font-bold tracking-[0.08em] text-ink uppercase transition-colors hover:bg-cream"
              >
                {slide.cta.label}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Previous / next on the two edges, vertically centred */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Slide trước"
          className="absolute top-1/2 left-2 -translate-y-1/2 p-3 text-white/60 transition-colors hover:text-white md:left-8"
        >
          <Chevron dir="left" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Slide tiếp theo"
          className="absolute top-1/2 right-2 -translate-y-1/2 p-3 text-white/60 transition-colors hover:text-white md:right-8"
        >
          <Chevron dir="right" />
        </button>
      </motion.div>

      {/* Kraft paper curtain with the name */}
      <motion.div
        className="kraft absolute inset-0 overflow-hidden will-change-transform shadow-[0_30px_60px_-20px_rgb(0_0_0/0.5)]"
        initial={false}
        animate={{ y: isVideo ? "-100%" : "0%" }}
        transition={{
          duration: t(1.2),
          ease: curtain,
          delay: isVideo ? t(0.15) : 0,
        }}
        inert={isVideo}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 hidden will-change-transform md:block"
          aria-hidden
          initial={false}
          animate={{ x: isVideo ? "-35%" : "0%", opacity: isVideo ? 0 : 1 }}
          transition={{ duration: t(0.9), ease }}
        >
          {beans.map((b, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `clamp(32px, ${b.w / 14}vw, ${b.w}px)`,
              }}
              initial={{ opacity: 0, y: -30, rotate: b.r - 40 }}
              animate={{ opacity: 1, y: 0, rotate: b.r }}
              transition={{ duration: t(1.1), delay: t(0.3 + i * 0.08), ease }}
            >
              <Image
                src={`/images/deco/bean-${b.b}.webp`}
                alt=""
                width={120}
                height={160}
                className="h-auto w-full drop-shadow-[0_10px_10px_rgb(59_46_37/0.35)]"
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="pointer-events-none absolute will-change-transform -right-[22%] -bottom-[10%] w-[72vw] max-w-[560px] md:top-1/2 md:-right-[14%] md:bottom-auto md:w-[34vw] md:-translate-y-[30%]"
          aria-hidden
          initial={false}
          animate={{
            x: isVideo ? "35%" : "0%",
            rotate: isVideo ? 35 : 0,
            opacity: isVideo ? 0 : 1,
          }}
          transition={{ duration: t(0.9), ease }}
        >
          <motion.div
            initial={{ opacity: 0, rotate: 25, scale: 0.9 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: t(1.4), delay: t(0.2), ease }}
          >
            <Image
              src="/images/deco/cup-top.webp"
              alt=""
              width={900}
              height={858}
              priority
              className="h-auto w-full drop-shadow-[0_30px_30px_rgb(59_46_37/0.35)]"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="relative grid size-full place-items-center px-6 text-center"
          initial={false}
          animate={{ opacity: isVideo ? 0 : 1, y: isVideo ? -40 : 0 }}
          transition={{ duration: t(0.6), ease, delay: isVideo ? 0 : t(0.5) }}
        >
          <div className="flex max-w-2xl flex-col items-center">
            {/* Stacked title: "a break with coffee", then the word repeated, each line lighter. */}
            <h1 className="font-display text-[32px] leading-[1.2] text-ink uppercase sm:text-5xl md:text-6xl">
              <span className="sr-only">
                Phjn Coffee: một chút nghỉ với cà phê
              </span>
              <span aria-hidden className="flex flex-col items-center">
                {[
                  ["Một chút nghỉ", "font-medium"],
                  ["với cà phê", "font-bold"],
                  ["cà phê", "font-bold text-ink/70"],
                  ["cà phê", "font-bold text-ink/45"],
                  ["cà phê", "font-semibold text-ink/25"],
                ].map(([text, cls], i) => (
                  <motion.span
                    key={i}
                    className={`block whitespace-nowrap ${cls}`}
                    initial={{ opacity: 0, x: i % 2 ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: t(0.9),
                      delay: t(0.1 + i * 0.1),
                      ease,
                    }}
                  >
                    {text}
                  </motion.span>
                ))}
              </span>
            </h1>
            <motion.p
              className="mt-6 max-w-lg text-base leading-relaxed text-ink-soft md:text-lg"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: t(1), delay: t(0.6), ease }}
            >
              Cà phê rang mộc, trà ủ trong ngày và bánh nướng mỗi sáng. Một góc
              Sài Gòn chậm rãi, để bạn tự chỉnh từng ly cho đúng khẩu vị.
            </motion.p>
            <motion.button
              type="button"
              onClick={() => setScene("video")}
              className="mt-10 flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: t(1), delay: t(1.1) }}
            >
              <span className="text-[11px] font-semibold tracking-[0.35em] text-ink-soft uppercase">
                Cuộn để khám phá
              </span>
              <span aria-hidden className="h-10 w-px overflow-hidden bg-ink/20">
                <span className="scroll-cue block h-1/2 w-full bg-ink/70" />
              </span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 28 56"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-10 w-5 md:h-14 md:w-7"
      aria-hidden
    >
      <path d={dir === "left" ? "M24 4 4 28l20 24" : "M4 4l20 24L4 52"} />
    </svg>
  );
}
