import { forwardRef } from "react"
import { cn } from "@/lib/utils"

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full px-3 py-2.5 text-sm rounded-lg border border-border-strong bg-bg-surface text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary",
          className
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"
