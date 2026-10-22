import type { Metadata } from "next";
import { TablesManager } from "@/components/admin/TablesManager";
import { store } from "@/lib/server/store";

export const metadata: Metadata = { title: "Bàn & QR" };
export const dynamic = "force-dynamic";

export default async function TablesPage() {
  const tables = await store.getTables();
  return <TablesManager tables={tables} />;
}
