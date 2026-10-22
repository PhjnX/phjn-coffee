"use client";

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label: string;
};

export function QuantityStepper({ value, onChange, min = 1, max = 20, size = "md", label }: Props) {
  const btn = size === "sm" ? "size-7 text-base" : "size-11 text-lg";
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-full border border-line bg-card">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Giảm"
        className={`${btn} grid place-items-center rounded-full transition-colors hover:bg-ink/5 disabled:opacity-30`}
      >
        −
      </button>
      <span className={`min-w-7 text-center font-semibold tabular-nums ${size === "sm" ? "text-sm" : ""}`} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Tăng"
        className={`${btn} grid place-items-center rounded-full transition-colors hover:bg-ink/5 disabled:opacity-30`}
      >
        +
      </button>
    </div>
  );
}
