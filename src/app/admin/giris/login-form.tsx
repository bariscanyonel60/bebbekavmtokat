"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/giris/actions";
import { buttonClass } from "@/components/ui/button-styles";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="text-sm font-medium text-ink">E-posta</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          className="mt-1.5 h-12 w-full rounded-xl border border-line-strong bg-white px-4 text-[0.95rem] focus:border-ink focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">Şifre</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="mt-1.5 h-12 w-full rounded-xl border border-line-strong bg-white px-4 text-[0.95rem] focus:border-ink focus:outline-none"
        />
      </label>
      {state && !state.ok ? (
        <p role="alert" className="rounded-xl bg-peach-soft px-4 py-3 text-sm text-rose-deep">
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "w-full")}>
        {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>
    </form>
  );
}
