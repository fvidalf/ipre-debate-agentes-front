import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { forwardRef } from "react";

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm",
        secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200",
        outline: "border border-primary-300 text-primary-700 hover:bg-primary-50 active:bg-primary-100",
        ghost: "text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200",
        danger: "bg-error-500 text-white hover:bg-error-600 active:bg-error-700 shadow-sm",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
      elevation: {
        none: "",
        subtle: "hover:shadow-sm",
        medium: "shadow-sm hover:shadow-md",
        high: "shadow-md hover:shadow-lg",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      elevation: "subtle",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, elevation, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, elevation, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export default Button;
