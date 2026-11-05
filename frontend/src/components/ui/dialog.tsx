import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Modal({
  open, onOpenChange, title, description, children, wide,
}: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children: ReactNode; wide?: boolean }) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 animate-overlay bg-pine-950/40 backdrop-blur-sm" />
        <D.Content
          className={cn(
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] animate-pop-in overflow-y-auto rounded-2xl bg-surface shadow-pop outline-none",
            wide ? "max-w-2xl" : "max-w-md",
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-zinc-900/5 px-6 py-4">
            <div>
              <D.Title className="font-display text-2xl leading-tight">{title}</D.Title>
              {description ? <D.Description className="mt-1 text-[13px] text-zinc-500">{description}</D.Description>
                : <D.Description className="sr-only">{title}</D.Description>}
            </div>
            <D.Close
              aria-label="Close"
              className="-mr-2 grid size-11 shrink-0 place-items-center rounded-full cursor-pointer text-zinc-500 outline-none transition-colors hover:bg-zinc-900/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-pine-500"
            >
              <X className="size-4" />
            </D.Close>
          </div>
          <div className="p-6">{children}</div>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
