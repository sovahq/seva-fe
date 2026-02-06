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
        "flex flex-col rounded-lg border bg-card p-6 shadow-sm",
        "border-[rgba(0,45,91,0.1)]",
        className
      )}
    >
      <h2
        className="text-lg font-semibold"
        style={{ color: "var(--primary)" }}
      >
        {title}
      </h2>
      {description ? (
        <p
          className="mt-0.5 text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          {description}
        </p>
      ) : null}
      <div
        className="mt-4 flex-1 space-y-2 text-sm"
        style={{ color: "rgba(0,45,91,0.9)" }}
      >
        {children}
      </div>
      <Link
        href={to}
        className="mt-4 text-sm font-medium underline-offset-2 hover:underline"
        style={{ color: "var(--primary)" }}
      >
        {viewAllLabel}
      </Link>
    </article>
  )
}
