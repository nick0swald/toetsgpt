import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-bold select-none transition-[opacity,transform,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:opacity-90",
        secondary: "bg-accent text-accent-foreground hover:opacity-90",
        ghost: "bg-transparent text-muted-foreground hover:text-foreground",
        outline: "bg-transparent text-foreground ring-1 ring-border hover:ring-primary",
        danger: "bg-destructive text-primary-foreground hover:opacity-90",
        exam: "bg-exam text-exam-foreground hover:opacity-90",
      },
      size: {
        md: "h-12 whitespace-nowrap rounded-full px-5 text-sm",
        lg: "min-h-14 w-full rounded-3xl px-5 py-3.5 text-left text-base [&_svg]:size-6",
        sm: "h-11 whitespace-nowrap rounded-full px-4 text-sm",
        icon: "size-11 rounded-full",
      },
      staticScale: {
        false: "",
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
