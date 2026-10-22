import { BeansIcon, CupIcon } from "../brand/Logo";

/** Page heading in the shop's style: small spaced kicker, serif title, bean divider, optional actions. */
export function PageHeader({
  kicker,
  title,
  subtitle,
  actions,
}: {
  kicker: string;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-caramel uppercase">{kicker}</p>
        <h1 className="mt-1.5 font-display text-3xl leading-tight md:text-4xl">{title}</h1>
        <div className="mt-3 flex items-center gap-3" aria-hidden>
          <span className="h-px w-10 bg-caramel/50" />
          <BeansIcon className="h-4 w-5 text-caramel" />
          <span className="h-px w-10 bg-caramel/50" />
        </div>
        {subtitle && <div className="mt-3 text-sm text-ink-soft">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Rounded card with an optional serif title row. */
export function Panel({
  title,
  action,
  className = "",
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-[28px] border border-line bg-card p-5 shadow-[0_18px_40px_-34px_rgb(59_46_37/0.6)] md:p-6 ${className}`}>
      {title && (
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-lg">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Friendly empty state with the cup mark. */
export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <span className="grid size-20 place-items-center rounded-full bg-paper-2">
        <CupIcon className="h-9 w-10 text-caramel" />
      </span>
      <p className="mt-4 font-display text-2xl">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-ink-soft">{text}</p>}
    </div>
  );
}

export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-caramel-dark disabled:opacity-60";
export const ghostButton =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line bg-card px-4 py-2.5 text-sm text-ink transition-colors hover:border-ink/30";
export const field =
  "w-full rounded-full border border-line bg-card px-4 py-2.5 text-base outline-none transition-colors placeholder:text-ink-soft/60 focus:border-caramel md:text-sm";
