"use client";

import { useId, type ReactNode } from "react";
import { useFieldError } from "@/components/admin/admin-form";
import { cx } from "@/lib/cx";

const inputClass =
  "w-full rounded-xl border bg-white px-4 text-[0.92rem] text-ink placeholder:text-ink-muted/70 focus:border-ink focus:outline-none aria-[invalid=true]:border-rose-deep";

type BaseProps = { name: string; label: string; hint?: string; required?: boolean; className?: string };

function FieldShell({ id, label, hint, error, required, className, children }: { id: string; label: string; hint?: string; error?: string; required?: boolean; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-rose-deep"> *</span> : null}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-deep">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({ name, label, hint, required, className, defaultValue, type = "text", placeholder, maxLength }: BaseProps & { defaultValue?: string | number | null; type?: string; placeholder?: string; maxLength?: number }) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        maxLength={maxLength}
        step={type === "number" ? "any" : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cx(inputClass, "h-11 border-line-strong")}
      />
    </FieldShell>
  );
}

export function TextArea({ name, label, hint, required, className, defaultValue, rows = 4, placeholder }: BaseProps & { defaultValue?: string | null; rows?: number; placeholder?: string }) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cx(inputClass, "border-line-strong py-3 leading-relaxed")}
      />
    </FieldShell>
  );
}

export function SelectField({ name, label, hint, required, className, defaultValue, options, emptyLabel }: BaseProps & { defaultValue?: string | null; options: { value: string; label: string }[]; emptyLabel?: string }) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        aria-invalid={error ? true : undefined}
        className={cx(inputClass, "h-11 border-line-strong")}
      >
        {emptyLabel !== undefined ? <option value="">{emptyLabel}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Toggle({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked?: boolean }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input id={id} type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span
        className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-line-strong transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-sage-deep peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sage-deep"
        aria-hidden="true"
      />
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {hint ? <span className="block text-xs text-ink-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

export function CheckboxList({ name, label, options, defaultValues, hint }: { name: string; label: string; options: { value: string; label: string; depth?: number }[]; defaultValues: string[]; hint?: string }) {
  const error = useFieldError(name);
  const selected = new Set(defaultValues);
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{label}</legend>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
      <div className="mt-2 max-h-72 space-y-0.5 overflow-y-auto rounded-xl border border-line-strong bg-white p-2">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-cream" style={{ paddingLeft: `${0.5 + (option.depth ?? 0) * 1.1}rem` }}>
            <input type="checkbox" name={name} value={option.value} defaultChecked={selected.has(option.value)} className="size-4 accent-sage-deep" />
            {option.label}
          </label>
        ))}
      </div>
      {error ? <p className="mt-1.5 text-xs text-rose-deep">{error}</p> : null}
    </fieldset>
  );
}
