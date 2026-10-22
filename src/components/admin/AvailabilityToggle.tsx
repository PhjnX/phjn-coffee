"use client";

import { useOptimistic, useTransition } from "react";
import { setAvailable } from "@/app/admin/actions";

/** On/off switch for "đang bán" vs "tạm hết". Flips immediately and saves in the background. */
export function AvailabilityToggle({ id, available }: { id: string; available: boolean }) {
  const [on, setOn] = useOptimistic(available);
  const [, startTransition] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={on ? "Đang bán, bấm để báo tạm hết" : "Tạm hết, bấm để bán lại"}
      onClick={() =>
        startTransition(async () => {
          setOn(!on);
          await setAvailable(id, !on);
        })
      }
      className="flex shrink-0 items-center gap-2 text-xs text-ink-soft"
    >
      <span className="hidden sm:inline">{on ? "Đang bán" : "Tạm hết"}</span>
      <span className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-matcha" : "bg-ink/20"}`}>
        <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-[left] ${on ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}
