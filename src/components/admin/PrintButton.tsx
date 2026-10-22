"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream hover:bg-caramel-dark">
      In
    </button>
  );
}
