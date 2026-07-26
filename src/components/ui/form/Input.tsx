import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Calendar } from "../Icon"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix?: string // contoh: "Rp" untuk field harga
}

const fieldWrapper =
  "flex items-center border border-border-strong rounded-lg bg-bg-surface focus-within:ring-2 focus-within:ring-primary overflow-hidden"

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ prefix, className, type, ...props }, ref) => {
    if (prefix) {
      return (
        <div className={fieldWrapper}>
          <span className="px-3 py-2.5 text-sm text-text-secondary bg-bg-elevated border-r border-border-strong select-none">
            {prefix}
          </span>
          <input
            ref={ref}
            type={type}
            className="flex-1 px-3 py-2.5 text-sm bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none"
            {...props}
          />
        </div>
      )
    }

    if (type === "date" || type === "month") {
      return (
        <div className="relative">
          <input
            ref={ref}
            type={type}
            className={cn(
              "w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-border-strong bg-bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary",
              "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full",
              className
            )}
            {...props}
          />
          <div className="pointer-events-none w-10 h-full absolute top-0 right-0 flex justify-center items-center bg-bg-elevated border border-border-strong rounded-r-lg text-text-muted">
            <Calendar size={16} className="pointer-events-none" />
          </div>
        </div>
      )
    }

    return (
      <input
        ref={ref}
        type={type}
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
