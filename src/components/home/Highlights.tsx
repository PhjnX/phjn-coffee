import { Reveal } from "./Reveal";

const points = [
  { title: "Hạt rang mộc", text: "Rang mỗi tuần", icon: <BeanIcon /> },
  { title: "Pha tay", text: "Từng ly một", icon: <DripIcon /> },
  { title: "Bánh mỗi sáng", text: "Ra lò 6:00", icon: <CroissantIcon /> },
  { title: "Gọi tại bàn", text: "Quét mã QR", icon: <QrIcon /> },
];

/**
 * Why Phjn: a short heading and line, then the four promises as rounded chips with a dark icon
 * disc. The chips scroll sideways on phones and sit in one row on wide screens.
 */
export function Highlights() {
  return (
    <section id="cau-chuyen" className="scroll-mt-16 bg-card py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <Reveal className="text-center">
          <h2 className="font-display text-[30px] leading-tight md:text-[44px]">
            Ngon hơn <em className="font-medium text-caramel-dark">một chút</em> mỗi ngày
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
            Một quán nhỏ cho cả nhóm bạn: người thích cà phê đậm, người chỉ uống trà trái cây, người ghé vì chiếc croissant vừa ra lò.
          </p>
        </Reveal>

        <ul className="no-scrollbar -mx-5 mt-8 flex snap-x gap-3 overflow-x-auto scroll-px-5 px-5 pb-1 md:mx-0 md:mt-10 md:grid md:grid-cols-4 md:gap-4 md:px-0">
          {points.map((p, i) => (
            <li key={p.title} className="shrink-0 snap-start">
              <Reveal delay={i * 0.07}>
                <div className="flex items-center gap-3 rounded-full bg-paper-2 py-2 pr-6 pl-2">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-espresso text-cream [&_svg]:size-6">{p.icon}</span>
                  <span className="leading-tight">
                    <span className="block text-sm font-semibold whitespace-nowrap">{p.title}</span>
                    <span className="block text-xs whitespace-nowrap text-ink-soft">{p.text}</span>
                  </span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BeanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <ellipse cx="12" cy="12" rx="6" ry="9" transform="rotate(30 12 12)" />
      <path d="M8 5c4 4 1 9 8 14" />
    </svg>
  );
}

function DripIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
      <path d="M5 4h14l-3 7H8z" />
      <path d="M3.5 12h17M12 14v2" />
      <path d="M7 18h10l-1 3H8z" />
    </svg>
  );
}

function CroissantIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
      <path d="M3 15c0-5 4-9 9-9s9 4 9 9c-2 1-4 1-5-1-1 2-3 3-4 3s-3-1-4-3c-1 2-3 2-5 1Z" />
      <path d="M9 7.5 10 14M15 7.5 14 14" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
      <path d="M14.5 14.5h2v2h-2zM18.5 14.5h2M14.5 20.5h2M18.5 18.5v2h2" />
    </svg>
  );
}
