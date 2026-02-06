"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { SevaLogoMark } from "./seva-logo-mark"

interface SevaLogoProps {
  asLink?: boolean
  to?: string
  size?: "sm" | "md" | "lg"
  /** Show only the mark (no wordmark). Useful for icon-only contexts. */
  markOnly?: boolean
  className?: string
  style?: React.CSSProperties
}

const markSizes = { sm: 20, md: 24, lg: 28 }
const sizeClasses = { sm: "text-lg", md: "text-xl", lg: "text-2xl" }

export function SevaLogo({
  asLink,
  to = "/",
  size = "md",
  markOnly = false,
  className,
  style,
}: SevaLogoProps) {
  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight",
        sizeClasses[size],
        className
      )}
      style={style}
    >
      <SevaLogoMark size={markSizes[size]} primary />
      {!markOnly && <span>Seva</span>}
    </span>
  )

  if (asLink && to) {
    return (
      <Link href={to} className="inline-flex transition-opacity hover:opacity-90">
        {content}
      </Link>
    )
  }

  return content
}
