import { cn } from "@/lib/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-xl border transition-all duration-150 hover:transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-neutral-200 bg-[#f3f3f3] hover:bg-white hover:shadow-md text-neutral-600 hover:text-neutral-900",
        active: "border-primary-300 bg-primary-50 shadow-md text-primary-700",
        ghost: "border-transparent bg-transparent hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900",
      },
      size: {
        sm: "w-8 h-8 text-sm",
        md: "w-10 h-10 text-lg",
        lg: "w-12 h-12 text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode;
  tooltip?: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon, tooltip, ...props }, ref) => {
    return (
      <button
        ref={ref}
        title={tooltip}
        className={cn(iconButtonVariants({ variant, size, className }))}
        {...props}
      >
        {icon}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";

export default IconButton;
