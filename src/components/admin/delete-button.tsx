"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

/** Silme işlemini onay penceresiyle tetikler; `action` sunucuda yetki kontrolü yapar. */
export function DeleteButton({ action, label = "Sil", confirmText }: { action: () => Promise<void>; label?: string; confirmText: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmText)) startTransition(() => action());
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-rose-deep transition-colors hover:bg-peach-soft disabled:opacity-50"
    >
      <Trash2 className="size-4" aria-hidden="true" />
      {pending ? "Siliniyor…" : label}
    </button>
  );
}
