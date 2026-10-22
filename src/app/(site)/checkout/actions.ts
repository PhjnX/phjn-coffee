"use server";

import { revalidatePath } from "next/cache";
import { buildOrder, type OrderInput, type OrderResult, orderCode } from "@/lib/order";
import { allow, clientIp } from "@/lib/server/rate-limit";
import { store } from "@/lib/server/store";

/**
 * Places an order. Phjn only takes orders at a table, opened by the QR code on it, so an order
 * without a known table is turned away. Everything is checked and priced again here from the menu, so a modified cart
 * in the browser cannot change what the customer pays. The order is then saved as "new" so it
 * shows up on the admin order board.
 */
export async function placeOrder(input: OrderInput): Promise<OrderResult> {
  // A table of friends may order a few times; dozens of orders a minute from one address is a script.
  if (!(await allow(`order:${await clientIp()}`, 8, 10 * 60_000))) {
    return { ok: false, errors: { form: "Bạn đặt quá nhiều đơn trong thời gian ngắn. Vui lòng thử lại sau ít phút hoặc gọi cho quán." } };
  }
  const [menu, tables] = await Promise.all([store.getMenu(), store.getTables()]);
  const now = new Date().toISOString();
  const result = buildOrder(input, menu, orderCode(), now);
  if (!result.ok) return result;

  const { order } = result;
  if (order.type !== "table") {
    return { ok: false, errors: { form: "Phjn chỉ nhận đơn tại quán. Hãy quét mã QR trên bàn để gọi món." } };
  }
  if (!tables.some((t) => t.number === order.table)) {
    return { ok: false, errors: { table: `Quán không có bàn số ${order.table}. Hãy quét lại mã QR trên bàn.` } };
  }

  try {
    await store.insertOrder({ ...order, status: "new", paid: false, updatedAt: now });
  } catch (err) {
    console.error(err);
    return { ok: false, errors: { form: "Chưa gửi được đơn, vui lòng thử lại sau giây lát." } };
  }
  revalidatePath("/admin", "layout");
  return result;
}
