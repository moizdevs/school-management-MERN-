import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Skeleton = ({ className, ...p }: HTMLAttributes<HTMLDivElement>) => (
  <div
    aria-hidden
    className={cn(
      "animate-shimmer rounded-lg bg-[linear-gradient(110deg,rgb(20_23_26/0.05)_30%,rgb(20_23_26/0.10)_50%,rgb(20_23_26/0.05)_70%)] bg-size-[200%_100%] motion-reduce:animate-none",
      className,
    )}
    {...p}
  />
);
