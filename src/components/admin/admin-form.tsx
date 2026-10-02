"use client";

import { createContext, startTransition, useActionState, useContext, type ReactNode } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { buttonClass } from "@/components/ui/button-styles";
import type { ActionState } from "@/lib/admin/form";

type FormAction = (prev: ActionState, form: FormData) => Promise<ActionState>;

const ErrorsContext = createContext<Record<string, string>>({});

export function useFieldError(name: string): string | undefined {
  return useContext(ErrorsContext)[name];
}

type AdminFormProps = {
  action: FormAction;
  submitLabel?: string;
  children: ReactNode;
  aside?: ReactNode;
  /** Aynı sayfada birden fazla form varsa "inline" kullanın; sabit kaydet çubukları üst üste biner. */
  submitPlacement?: "fixed" | "inline";
};

export function AdminForm({ action, submitLabel = "Kaydet", children, aside, submitPlacement = "fixed" }: AdminFormProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const submitButton = (
    <button type="submit" disabled={pending} className={buttonClass("primary", "md")}>
      {pending ? "Kaydediliyor…" : submitLabel}
    </button>
  );
  return (
    <ErrorsContext.Provider value={state?.errors ?? {}}>
      <form
        className={submitPlacement === "fixed" ? "pb-28" : undefined}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          startTransition(() => formAction(data));
        }}
      >
        {state ? (
          <div
            role={state.ok ? "status" : "alert"}
            className={`mb-6 flex items-start gap-3 rounded-2xl px-5 py-4 text-sm ${state.ok ? "bg-sage-soft text-sage-deep" : "bg-peach-soft text-rose-deep"}`}
          >
            {state.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
            {state.message}
          </div>
        ) : null}
        <div className={aside ? "grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]" : undefined}>
          <div className="space-y-6">{children}</div>
          {aside ? <div className="space-y-6">{aside}</div> : null}
        </div>
        {submitPlacement === "fixed" ? (
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur lg:left-64">
            <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-5 py-3 md:px-8">{submitButton}</div>
          </div>
        ) : (
          <div className="mt-6 flex justify-end">{submitButton}</div>
        )}
      </form>
    </ErrorsContext.Provider>
  );
}

export function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-white p-5 md:p-7">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
