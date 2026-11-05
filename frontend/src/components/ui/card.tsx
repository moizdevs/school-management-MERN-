import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Root({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl bg-surface shadow-card", className)} {...p} />;
}
function Header({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-start justify-between gap-4 border-b border-zinc-900/5 px-5 py-4 sm:px-6", className)} {...p} />;
}
function Title({ className, ...p }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-[15px] font-semibold tracking-tight", className)} {...p} />;
}
function Description({ className, ...p }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-0.5 text-[13px] text-zinc-500", className)} {...p} />;
}
function Content({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6", className)} {...p} />;
}

export const Card = Object.assign(Root, { Header, Title, Description, Content });
