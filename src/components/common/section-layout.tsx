import React from "react"
import { cn } from "@/lib/utils"

interface SectionLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SectionLayout({ children, className, ...props }: SectionLayoutProps) {
  return (
    <section className={cn("space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-8", className)} {...props}>
      {children}
    </section>
  )
}
