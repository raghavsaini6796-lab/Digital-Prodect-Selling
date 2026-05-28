import React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  children?: React.ReactNode // For action buttons
}

export function PageHeader({ title, description, children, className, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn("flex flex-col items-start justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center sm:gap-8", className)}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex w-full sm:w-auto items-center gap-2">{children}</div>}
    </div>
  )
}
