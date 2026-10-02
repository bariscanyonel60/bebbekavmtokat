import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/admin/giris/login-form";
import { getAdminUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Giriş" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getAdminUser()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <div className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-sm">
        <p className="text-center font-display text-3xl text-ink">Bebbek AVM</p>
        <p className="mt-1 text-center text-sm text-ink-muted">Yönetim paneline giriş yapın</p>
        <div className="mt-8 rounded-3xl border border-line bg-white p-7 shadow-soft">
          <LoginForm next={typeof next === "string" ? next : ""} />
        </div>
      </div>
    </div>
  );
}
