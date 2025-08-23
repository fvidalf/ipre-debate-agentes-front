import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { forwardRef } from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-150",
  {
    variants: {
      variant: {
        default: "border-neutral-200 bg-neutral-100 text-neutral-800",
        primary: "border-primary-200 bg-primary-100 text-primary-800",
        success: "border-green-200 bg-green-100 text-green-800",
        warning: "border-yellow-200 bg-yellow-100 text-yellow-800",
        error: "border-red-200 bg-red-100 text-red-800",
        outline: "border-current text-current",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export default Badge;
