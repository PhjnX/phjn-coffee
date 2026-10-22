import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./Reveal";

/** A dark card for the bakery: text on one side, a photo of coffee and croissant on the other. */
export function BakeryCard() {
  return (
    <section className="bg-paper px-5 pb-14 md:px-10 md:pb-24">
      <Reveal className="mx-auto grid max-w-6xl overflow-hidden rounded-[28px] bg-espresso text-cream md:grid-cols-2">
        <div className="relative aspect-[16/10] md:order-2 md:aspect-auto md:min-h-[320px]">
          <Image src="/images/scenes/croissant-coffee.webp" alt="Croissant và tách cà phê" fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center p-7 md:p-12">
          <p className="text-xs font-semibold tracking-[0.2em] text-caramel uppercase">Bếp bánh của Phjn</p>
          <h2 className="mt-3 font-display text-[30px] leading-tight md:text-[40px]">
            Ra lò lúc <em className="font-medium text-caramel">6 giờ sáng</em>
          </h2>
          <span aria-hidden className="mt-5 block h-px w-full bg-cream/20" />
          <p className="mt-5 text-[15px] leading-relaxed text-cream/80">
            Croissant bơ Pháp, bánh ngàn lớp, tiramisu và cookie nướng ngay tại bếp. Gọi kèm một ly cà phê cho bữa sáng trọn vẹn.
          </p>
          <Link
            href="/menu#cat-banh"
            className="mt-6 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-caramel px-6 text-sm font-semibold text-espresso transition-colors hover:bg-cream"
          >
            Xem các loại bánh <span aria-hidden>→</span>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
