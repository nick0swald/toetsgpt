import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium select-none transition-[transform,background-color,box-shadow,opacity] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[0_1px_0_rgba(255,255,255,0.18)_inset]",
        secondary:
          "bg-card text-foreground shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
        ghost: "bg-transparent text-muted-foreground hover:text-foreground",
        outline:
          "bg-transparent text-foreground shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
        danger: "bg-destructive text-white",
      },
      size: {
        md: "min-h-11 rounded-lg px-4 text-sm",
        lg: "min-h-12 w-full rounded-xl px-5 text-base",
        sm: "min-h-10 rounded-md px-3 text-sm",
        icon: "size-11 rounded-lg",
      },
      staticScale: {
        false: "active:scale-[0.96]",
        true: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      staticScale: false,
    },
  },
);

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> & { asChild?: boolean }
>(({ className, variant, size, staticScale, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size, staticScale }), className)}
      {...props}
    />
  );
});
Button.displayName = "Button";
