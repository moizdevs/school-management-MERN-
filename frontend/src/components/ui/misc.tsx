import type { ReactNode } from "react";
import { cn, initials } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-rise">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-brass-600">{eyebrow}</p>}
        <h1 className="font-display text-[2.5rem] leading-none tracking-tight sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-[15px] text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Avatar({ name, src, className }: { name?: string; src?: string; className?: string }) {
  return src ? (
    <img src={src} alt="" className={cn("size-9 rounded-full object-cover", className)} />
  ) : (
    <span aria-hidden className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-pine-100 text-xs font-semibold text-pine-700 ring-1 ring-inset ring-pine-500/10", className)}>
      {initials(name)}
    </span>
  );
}

export function Stat({ label, value, hint, icon, tone = "default", i = 0 }: { label: string; value: ReactNode; hint?: string; icon?: ReactNode; tone?: "default" | "dark"; i?: number }) {
  return (
    <div
      style={{ "--i": i } as React.CSSProperties}
      className={cn("stagger relative overflow-hidden rounded-2xl p-5", tone === "dark" ? "bg-pine-900 text-white shadow-press" : "bg-surface shadow-card")}
    >
      <div className="flex items-center justify-between">
        <p className={cn("text-[13px] font-medium", tone === "dark" ? "text-pine-100/80" : "text-zinc-500")}>{label}</p>
        {icon && <span className={cn("grid size-8 place-items-center rounded-lg", tone === "dark" ? "bg-white/10 text-brass-300" : "bg-pine-50 text-pine-600")}>{icon}</span>}
      </div>
      <p className="mt-4 font-display text-5xl leading-none tracking-tight tabular-nums">{value}</p>
      {hint && <p className={cn("mt-2 text-xs", tone === "dark" ? "text-pine-100/70" : "text-zinc-500")}>{hint}</p>}
    </div>
  );
}

export function ConfirmText({ children }: { children: ReactNode }) {
  return <p className="text-sm text-zinc-600">{children}</p>;
}
