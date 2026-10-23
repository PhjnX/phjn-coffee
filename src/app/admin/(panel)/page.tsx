import Link from "next/link";
import { addDemoData, clearDemoData } from "@/app/admin/actions";
import { ghostButton, PageHeader, Panel, primaryButton } from "@/components/admin/AdminUI";
import { SERIES } from "@/components/admin/chart-colors";
import { BarList, ColumnChart } from "@/components/admin/charts";
import { formatVND } from "@/lib/format";
import { vnDay } from "@/lib/order";
import { store, vnDayBounds } from "@/lib/server/store";
import { computeStats, dayRange } from "@/lib/stats";

export const dynamic = "force-dynamic";

const PERIODS = [7, 14, 30] as const;

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ ky?: string }> }) {
  const { ky } = await searchParams;
  const days = PERIODS.find((p) => String(p) === ky) ?? 7;
  // This period plus the one before it, for the deltas.
  const todayKey = vnDay(Date.now());
  const from = vnDayBounds(dayRange(todayKey, days * 2)[0])[0];
  const [orders, menu, counts] = await Promise.all([store.ordersBetween(from, vnDayBounds(todayKey)[1]), store.getMenu(), store.countOrders()]);
  const s = computeStats(orders, menu, days);
  const today = computeStats(orders, menu, 1);
  const open = orders.filter((o) => vnDay(o.createdAt) === todayKey && ["new", "preparing", "ready"].includes(o.status));
  const hasDemo = counts.demo > 0;
  const empty = counts.total === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Tổng quan"
        title="Kinh doanh"
        subtitle={`${days} ngày gần nhất, so với ${days} ngày trước đó`}
        actions={
          <>
            <nav aria-label="Khoảng thời gian" className="flex rounded-full bg-paper-2 p-1 text-sm">
              {PERIODS.map((p) => (
                <Link
                  key={p}
                  href={p === 7 ? "/admin" : `/admin?ky=${p}`}
                  aria-current={p === days ? "page" : undefined}
                  className={`rounded-full px-4 py-1.5 transition-colors ${p === days ? "bg-card font-semibold shadow-sm" : "text-ink-soft hover:text-ink"}`}
                >
                  {p} ngày
                </Link>
              ))}
            </nav>
            <Link href="/admin/don-hang" className={primaryButton}>
              Bảng đơn {open.length > 0 && <span className="rounded-full bg-caramel px-2 py-0.5 text-xs">{open.length}</span>}
            </Link>
          </>
        }
      />

      {(empty || hasDemo) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-dashed border-caramel/50 bg-caramel/5 px-5 py-4 text-sm">
          <p className="text-ink-soft">
            {empty ? "Chưa có đơn nào nên biểu đồ còn trống. Tạo 30 ngày dữ liệu mẫu để xem thử?" : "Đang hiển thị kèm dữ liệu mẫu. Đơn thật vẫn được giữ khi xoá dữ liệu mẫu."}
          </p>
          <form action={empty ? addDemoData : clearDemoData}>
            <button type="submit" className={ghostButton}>
              {empty ? "Tạo dữ liệu mẫu" : "Xoá dữ liệu mẫu"}
            </button>
          </form>
        </div>
      )}

      {/* Headline figures */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <Figure label="Doanh thu" value={formatVND(s.revenue)} now={s.revenue} before={s.prevRevenue} hero />
        <Figure label="Số đơn" value={String(s.orders)} now={s.orders} before={s.prevOrders} />
        <Figure label="Giá trị trung bình / đơn" value={formatVND(s.avgTicket)} />
        <Figure label="Hôm nay" value={formatVND(today.revenue)} note={`${today.orders} đơn · ${open.length} đang chờ`} />
      </div>

      <Panel title="Doanh thu theo ngày" action={<span className="hidden text-sm text-ink-soft sm:inline">rê chuột để xem từng ngày</span>}>
        <ColumnChart
          ariaLabel={`Doanh thu ${days} ngày gần nhất`}
          data={s.daily.map((d) => ({ key: d.day, label: d.label, value: d.revenue, detail: `${d.orders} đơn` }))}
          unit="vnd"
          height={260}
          emphasizeLast
        />
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-ink-soft hover:text-ink">Xem bảng số liệu</summary>
          <table className="mt-3 w-full text-left tabular-nums">
            <thead className="text-xs text-ink-soft">
              <tr>
                <th className="py-1.5 font-medium">Ngày</th>
                <th className="py-1.5 text-right font-medium">Số đơn</th>
                <th className="py-1.5 text-right font-medium">Doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[...s.daily].reverse().map((d) => (
                <tr key={d.day}>
                  <td className="py-1.5">{d.label}</td>
                  <td className="py-1.5 text-right">{d.orders}</td>
                  <td className="py-1.5 text-right">{formatVND(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Giờ cao điểm" action={<span className="hidden text-sm text-ink-soft sm:inline">số đơn theo giờ</span>}>
          <ColumnChart
            ariaLabel="Số đơn theo giờ trong ngày"
            data={s.hourly.map((h) => ({ key: String(h.hour), label: `${h.hour}h`, value: h.orders, detail: formatVND(h.revenue) }))}
            unit="orders"
            color={SERIES.secondary}
            height={320}
          />
        </Panel>
        <Panel title="Bàn có doanh thu cao nhất">
          {s.tables.length > 0 ? (
            <BarList items={s.tables.map((t) => ({ ...t, note: `· ${t.qty} đơn` }))} unit="compact" />
          ) : (
            <p className="text-sm text-ink-soft">Chưa có đơn tại bàn trong khoảng này.</p>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Món bán chạy">
          {s.topProducts.length ? (
            <BarList items={s.topProducts.map((p) => ({ name: p.name, value: p.qty }))} unit="portions" />
          ) : (
            <p className="text-sm text-ink-soft">Chưa có dữ liệu.</p>
          )}
        </Panel>
        <Panel title="Doanh thu theo danh mục">
          {s.byCategory.length ? <BarList items={s.byCategory} unit="vnd" /> : <p className="text-sm text-ink-soft">Chưa có dữ liệu.</p>}
        </Panel>
      </div>
    </div>
  );
}

/** Stat tile: label, value, and a signed change vs the previous period (arrow + text, not colour alone). */
function Figure({ label, value, now, before, note, hero = false }: { label: string; value: string; now?: number; before?: number; note?: string; hero?: boolean }) {
  let delta: { text: string; up: boolean } | null = null;
  if (now !== undefined && before !== undefined) {
    if (before > 0) {
      const pct = Math.round(((now - before) / before) * 100);
      delta = { text: `${pct > 0 ? "+" : ""}${pct}% so với kỳ trước`, up: pct >= 0 };
    } else if (now > 0) delta = { text: "Mới so với kỳ trước", up: true };
  }
  return (
    <div className={`rounded-[24px] border p-4 md:p-5 ${hero ? "border-ink bg-ink text-cream" : "border-line bg-card shadow-[0_18px_40px_-34px_rgb(29_43_69/0.6)]"}`}>
      <p className={`text-sm ${hero ? "text-cream/70" : "text-ink-soft"}`}>{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums md:text-[28px]">{value}</p>
      {delta && (
        <p className={`mt-1.5 flex items-center gap-1 text-xs ${hero ? "text-cream/80" : delta.up ? "text-[#4d6b2f]" : "text-[#9a3a24]"}`}>
          <span aria-hidden>{delta.up ? "▲" : "▼"}</span>
          {delta.text}
        </p>
      )}
      {note && <p className={`mt-1.5 text-xs ${hero ? "text-cream/70" : "text-ink-soft"}`}>{note}</p>}
    </div>
  );
}
