"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface SevaLogoProps {
  asLink?: boolean
  to?: string
  size?: "sm" | "md" | "lg"
  className?: string
  style?: React.CSSProperties
}

export function SevaLogo({
  asLink,
  to = "/",
  size = "md",
  className,
  style,
}: SevaLogoProps) {
  const sizeClass = size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl"

  const content = (
    <span
      className={cn("font-semibold tracking-tight", sizeClass, className)}
      style={style}
    >
      Seva
    </span>
  )

  if (asLink && to) {
    return (
      <Link href={to} className="inline-block transition-colors">
        {content}
      </Link>
    )
  }

  return content
}
