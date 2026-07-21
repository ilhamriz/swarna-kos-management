import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { ArrowDown } from "../Icon"

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="group relative">
        <select
          ref={ref}
          className={cn(
            "w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-border-strong bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ArrowDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-transform duration-300 group-focus-within:rotate-180" />
      </div>
    )
  }
)

Select.displayName = "Select"
