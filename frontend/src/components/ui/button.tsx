import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-pine-900 text-white shadow-press hover:bg-pine-700 active:translate-y-px active:shadow-none",
  secondary:
    "bg-white text-ink shadow-card hover:bg-zinc-50 active:translate-y-px",
  ghost: "text-zinc-600 hover:bg-zinc-900/5 hover:text-ink active:bg-zinc-900/10",
  danger:
    "bg-red-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.15),0_0_0_1px_rgb(153_27_27/0.9)] hover:bg-red-700 active:translate-y-px",
} as const;
const sizes = {
  md: "min-h-11 px-4 text-sm",
  sm: "min-h-9 px-3 text-[13px]",
  icon: "size-11",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, asChild, children, ...p }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex select-none items-center justify-center gap-2 rounded-full cursor-pointer font-medium outline-none transition-[background,transform,box-shadow] duration-200 ease-out",
          "focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
          "disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:translate-y-0",
          variants[variant],
          sizes[size],
          className,
        )}
        {...p}
      >
        {asChild ? children : (<>{loading && <Loader2 className="size-4 animate-spin" aria-hidden />}{children}</>)}
      </Comp>
    );
  },
);
Button.displayName = "Button";
