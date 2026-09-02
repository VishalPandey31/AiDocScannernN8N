import React from "react"
import { cn } from "../../utils/cn"

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "border-transparent bg-primary-subtle text-primary hover:bg-primary-subtle/80",
    secondary: "border-transparent bg-surface-muted text-foreground hover:bg-surface-muted/80",
    destructive: "border-transparent bg-danger-subtle text-danger hover:bg-danger-subtle/80",
    success: "border-transparent bg-success-subtle text-success hover:bg-success-subtle/80",
    warning: "border-transparent bg-warning-subtle text-warning hover:bg-warning-subtle/80",
    info: "border-transparent bg-info-subtle text-info hover:bg-info-subtle/80",
    outline: "text-foreground",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
