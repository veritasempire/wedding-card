import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        invitation: "relative block h-auto w-auto overflow-visible rounded-none bg-transparent p-0 shadow-none disabled:opacity-100",
        hero: "border border-primary bg-primary px-7 text-primary-foreground shadow-[var(--shadow-gold)] hover:bg-primary/90",
        heroOutline: "border border-primary/60 bg-background/10 px-7 text-primary backdrop-blur-sm hover:bg-primary hover:text-primary-foreground",
        navy: "border border-primary bg-secondary text-secondary-foreground shadow-[var(--shadow-soft)] hover:bg-primary hover:text-primary-foreground",
        gold: "border border-primary bg-primary text-primary-foreground shadow-[var(--shadow-gold)] hover:bg-primary/90",
        goldLink: "h-auto rounded-none border-b border-primary/60 bg-transparent px-0 py-2 text-primary shadow-none hover:border-primary hover:bg-transparent",
        navIcon: "border border-border/50 bg-background/90 text-foreground shadow-none backdrop-blur-md hover:bg-accent",
        music: "border border-primary/40 bg-secondary text-primary shadow-[var(--shadow-soft)] hover:bg-secondary",
        lightbox: "border border-primary/40 bg-secondary/60 text-primary shadow-none backdrop-blur-md hover:bg-primary hover:text-primary-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
