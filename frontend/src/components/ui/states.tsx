import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "./skeleton";

export function Empty({ icon: Icon = Inbox, title, body, action }: { icon?: LucideIcon; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="grid place-items-center px-6 py-16 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-pine-50 text-pine-600 shadow-[inset_0_0_0_1px_var(--color-pine-100)]">
        <Icon className="size-5" aria-hidden />
      </div>
      <p className="font-display text-xl">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-zinc-500">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-inset ring-red-200/70">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="flex-1">{message}</div>
      {onRetry && <button onClick={onRetry} className="min-h-11 px-2 font-medium underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded">Retry</button>}
    </div>
  );
}

export const TableSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <div className="divide-y divide-zinc-900/5" aria-busy aria-label="Loading">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex h-15 items-center gap-4 px-5">
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="ml-auto h-3.5 w-24" />
      </div>
    ))}
  </div>
);
