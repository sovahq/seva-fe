"use client"

import * as React from "react"
import type { BoardPosition } from "@/types"

type ViewAsContextValue = {
  viewAsPosition: BoardPosition | null
  setViewAsPosition: (position: BoardPosition | null) => void
}

const ViewAsContext = React.createContext<ViewAsContextValue | null>(null)

export function ViewAsProvider({ children }: { children: React.ReactNode }) {
  const [viewAsPosition, setViewAsPosition] = React.useState<BoardPosition | null>(null)
  const value = React.useMemo(
    () => ({ viewAsPosition, setViewAsPosition }),
    [viewAsPosition]
  )
  return <ViewAsContext.Provider value={value}>{children}</ViewAsContext.Provider>
}

export function useViewAs(): ViewAsContextValue {
  const ctx = React.useContext(ViewAsContext)
  if (!ctx) {
    throw new Error("useViewAs must be used within a ViewAsProvider")
  }
  return ctx
}
