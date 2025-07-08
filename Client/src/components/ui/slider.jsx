import * as React from "react"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("relative flex w-full touch-none select-none items-center", className)} {...props}>
    <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <div className="absolute h-full bg-primary" style={{ width: `${(props.defaultValue?.[0] || 0) * 20}%` }} />
    </div>
    <div
      className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      style={{ marginLeft: `${(props.defaultValue?.[0] || 0) * 20 - 10}%` }}
    />
  </div>
))
Slider.displayName = "Slider"

export { Slider }
