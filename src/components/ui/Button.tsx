import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Spinner } from "./Icon"

export const buttonVariants = cva(
  "relative w-full inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors duration-300 disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-hover",
        secondary:
          "bg-transparent text-text-primary border border-border hover:bg-bg-elevated hover:border-border-strong",
        ghost: "bg-transparent text-primary hover:bg-bg-elevated",
        danger: "bg-danger text-white hover:bg-danger-hover",
      },
      size: {
        default: "h-11 px-4 min-w-[44px]",
        small: "px-2 py-1 rounded-sm text-xs",
        icon: "h-11 w-11 shrink-0 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  ariaLabel?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = "button",
      className,
      variant = "primary",
      size,
      isLoading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          buttonVariants({ variant, size }),
          className,
          disabled && "cursor-not-allowed"
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? <Spinner /> : children}
      </button>
    )
  }
)

Button.displayName = "Button"
