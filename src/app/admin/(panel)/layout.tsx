import type { ReactNode } from "react";
import { logout } from "@/app/admin/giris/actions";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/auth/session";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  return (
    <>
      <AdminSidebar userName={user.name || user.email} logoutAction={logout} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </>
  );
}
