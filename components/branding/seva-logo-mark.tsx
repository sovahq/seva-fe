"use client"

import { cn } from "@/lib/utils"

interface SevaLogoMarkProps {
  className?: string
  size?: number
  /** Use primary (brand blue) when true; otherwise currentColor */
  primary?: boolean
}

/**
 * Logo mark for Seva: a clean "S" that reads at any size (favicon to hero).
 * Stroke-based so it stays crisp when scaled.
 */
export function SevaLogoMark({
  className,
  size = 24,
  primary = true,
}: SevaLogoMarkProps) {
  const color = primary ? "var(--primary)" : "currentColor"
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M10 8c6 0 6 4 6 6s-2 4-6 4c-4 0-6 2-6 6s2.5 6 8 6"
        stroke={color}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
