import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix?: string // contoh: "Rp" untuk field harga
}

const fieldWrapper =
  "flex items-center border border-border-strong rounded-lg bg-bg-surface focus-within:ring-2 focus-within:ring-primary overflow-hidden"

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ prefix, className, ...props }, ref) => {
    if (prefix) {
      return (
        <div className={fieldWrapper}>
          <span className="px-3 py-2.5 text-sm text-text-secondary bg-bg-elevated border-r border-border-strong select-none">
            {prefix}
          </span>
          <input
            ref={ref}
            className="flex-1 px-3 py-2.5 text-sm bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none"
            {...props}
          />
        </div>
      )
    }

    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-3 py-2.5 text-sm rounded-lg border border-border-strong bg-bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"
