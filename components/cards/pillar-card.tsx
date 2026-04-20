"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface PillarCardProps {
  title: string
  description?: string
  to?: string
  viewAllLabel?: string
  children: ReactNode
  className?: string
}

export function PillarCard({
  title,
  description,
  to = "#",
  viewAllLabel = "View all",
  children,
  className,
}: PillarCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-[1.25rem] border border-border bg-card p-8 shadow-none",
        className
      )}
    >
      <h2 className="text-lg font-semibold text-primary">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-5 flex-1 space-y-2 text-sm text-foreground">{children}</div>
      <Link
        href={to}
        className="mt-5 text-sm font-semibold text-brand-link underline-offset-4 transition-colors hover:text-primary"
      >
        {viewAllLabel}
      </Link>
    </article>
  )
}
