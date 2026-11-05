import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full min-h-11 rounded-xl bg-white px-3.5 text-sm text-ink shadow-[0_0_0_1px_rgb(20_23_26/0.1)] outline-none transition-shadow duration-150 placeholder:text-zinc-400 " +
  "hover:shadow-[0_0_0_1px_rgb(20_23_26/0.2)] focus-visible:shadow-[0_0_0_2px_var(--color-pine-500)] disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...p }, ref) => <input ref={ref} className={cn(control, className)} {...p} />,
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...p }, ref) => <textarea ref={ref} className={cn(control, "min-h-24 py-3", className)} {...p} />,
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...p }, ref) => (
    <div className="relative">
      <select ref={ref} className={cn(control, "appearance-none pr-9", className)} {...p}>{children}</select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
    </div>
  ),
);
Select.displayName = "Select";

/** <Field label="Name">{(id) => <Input id={id} />}</Field> keeps labels wired to controls. */
export function Field({
  label, hint, className, children,
}: { label: string; hint?: string; className?: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-zinc-700">{label}</label>
      {children(id)}
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
