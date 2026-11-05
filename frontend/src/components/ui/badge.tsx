import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-zinc-900/5 text-zinc-700",
  good: "bg-pine-50 text-pine-700 ring-pine-100",
  warn: "bg-amber-50 text-amber-800 ring-amber-200/60",
  bad: "bg-red-50 text-red-700 ring-red-200/60",
  brass: "bg-brass-300/30 text-brass-600 ring-brass-300/50",
} as const;

export function Badge({ tone = "neutral", className, ...p }: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ring-transparent", tones[tone], className)}
      {...p}
    />
  );
}
