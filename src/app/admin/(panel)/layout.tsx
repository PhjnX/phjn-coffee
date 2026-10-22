import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: { default: "Quản trị", template: "%s · Quản trị Phjn" }, robots: { index: false } };

/** Every page in here needs the admin cookie. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
