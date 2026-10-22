import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "@/components/admin/PrintButton";
import { TableQr } from "@/components/admin/TableQr";
import { Logo } from "@/components/brand/Logo";
import { store } from "@/lib/server/store";

export const metadata: Metadata = { title: "In mã QR" };
export const dynamic = "force-dynamic";

/** Print sheet: one card per table (name, number, QR, short instruction), four to an A4 page. */
export default async function PrintTablesPage() {
  const tables = await store.getTables();
  return (
    <div>
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link href="/admin/ban" className="text-sm text-ink-soft hover:text-ink">
          ← Bàn & QR
        </Link>
        <PrintButton />
      </div>
      <p className="mt-2 text-sm text-ink-soft print:hidden">Mỗi trang A4 in được 4 thẻ. Cắt theo viền rồi đặt lên bàn.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 print:mt-0 print:grid-cols-2 print:gap-0">
        {tables.map((t) => (
          <div
            key={t.number}
            className="flex break-inside-avoid flex-col items-center rounded-3xl border border-line bg-white p-6 text-center print:h-[148mm] print:justify-center print:rounded-none print:border-dashed"
          >
            <Logo className="w-36 text-ink" />
            <p className="mt-4 font-display text-4xl">Bàn {t.number}</p>
            <TableQr number={t.number} size={200} className="mt-4" />
            <p className="mt-4 text-[15px] font-semibold">Quét để xem thực đơn và gọi món</p>
            <p className="mt-1 text-xs text-ink-soft">Không cần cài ứng dụng · Thanh toán tại quầy hoặc chuyển khoản</p>
          </div>
        ))}
      </div>
    </div>
  );
}
