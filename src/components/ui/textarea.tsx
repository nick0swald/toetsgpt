import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-36 w-full rounded-2xl bg-card px-4 py-3 text-base leading-relaxed text-foreground",
      "shadow-[var(--shadow-border)] placeholder:text-subtle",
      "transition-[box-shadow] duration-150 ease-out",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
