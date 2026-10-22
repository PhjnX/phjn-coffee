import type { Metadata } from "next";
import { OrdersBoard } from "@/components/admin/OrdersBoard";
import { vnDay } from "@/lib/order";
import { store, vnDayBounds } from "@/lib/server/store";

export const metadata: Metadata = { title: "Đơn hàng" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const today = vnDay(Date.now());
  const [orders, tables] = await Promise.all([store.ordersBetween(...vnDayBounds(today)), store.getTables()]);
  return <OrdersBoard today={today} initialOrders={orders} tables={tables.map((t) => t.number)} />;
}
