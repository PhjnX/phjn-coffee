"use client";

import Link from "next/link";
import QRCode from "qrcode";
import { useActionState, useEffect, useRef } from "react";
import { addTable, deleteTable } from "@/app/admin/actions";
import type { Table } from "@/lib/server/store/types";
import { PageHeader } from "./AdminUI";
import { TableQr, tableLink } from "./TableQr";

async function download(number: string) {
  const url = await QRCode.toDataURL(tableLink(number), { margin: 2, width: 1024, color: { dark: "#2e231c", light: "#ffffff" } });
  const a = document.createElement("a");
  a.href = url;
  a.download = `phjn-ban-${number}.png`;
  a.click();
}

/** Tables with their QR codes: add, remove, download one, or open the print sheet. */
export function TablesManager({ tables }: { tables: Table[] }) {
  const [state, action, pending] = useActionState(addTable, undefined);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state && !state.error) form.current?.reset();
  }, [state]);

  const next = String(Math.max(0, ...tables.map((t) => Number(t.number))) + 1);

  return (
    <div>
      <PageHeader
        kicker="Gọi món tại bàn"
        title="Bàn & mã QR"
        subtitle={<span className="block max-w-xl">
            Mỗi bàn có một mã QR dẫn tới thực đơn kèm số bàn. Khách quét là gọi món tại bàn, đơn hiện lên trang Đơn hàng với đúng số bàn.
        </span>}
        actions={
          <Link href="/admin/ban/in" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream hover:bg-caramel-dark">
            In tất cả mã QR
          </Link>
        }
      />

      <form ref={form} action={action} className="mt-8 flex flex-wrap items-end gap-3 rounded-[24px] border border-line bg-card p-5 shadow-[0_18px_40px_-34px_rgb(59_46_37/0.6)]">
        <label className="block w-28">
          <span className="mb-1.5 block text-sm font-medium">Số bàn</span>
          <input name="number" inputMode="numeric" defaultValue={next} key={next} className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-base outline-none focus:border-caramel" />
        </label>
        <label className="block min-w-40 flex-1">
          <span className="mb-1.5 block text-sm font-medium">Khu vực</span>
          <input name="area" placeholder="Tầng 1, Sân trước…" className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-base outline-none focus:border-caramel" />
        </label>
        <button type="submit" disabled={pending} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream hover:bg-caramel-dark disabled:opacity-60">
          + Thêm bàn
        </button>
        {state?.error && <p className="w-full text-sm text-[#9a3a24]">{state.error}</p>}
      </form>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {tables.map((t) => (
          <li key={t.number} className="flex flex-col items-center rounded-[24px] border border-line bg-card p-5 text-center shadow-[0_18px_40px_-34px_rgb(59_46_37/0.6)]">
            <p className="font-display text-3xl">Bàn {t.number}</p>
            <p className="text-xs text-ink-soft">{t.area}</p>
            <TableQr number={t.number} size={128} className="mt-3" />
            <p className="mt-2 w-full truncate text-[11px] text-ink-soft">
              /menu?ban={t.number}
            </p>
            <div className="mt-3 flex w-full gap-2">
              <button type="button" onClick={() => download(t.number)} className="flex-1 rounded-full border border-line py-2 text-xs hover:border-ink/40">
                Tải PNG
              </button>
              <button
                type="button"
                onClick={() => confirm(`Xoá bàn ${t.number}? Mã QR đã in của bàn này sẽ không gọi món được nữa.`) && deleteTable(t.number)}
                className="rounded-full px-3 py-2 text-xs text-[#9a3a24] hover:bg-[#b4442b]/10"
              >
                Xoá
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
