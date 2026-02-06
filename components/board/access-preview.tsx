"use client"

import type { BoardPosition } from "@/types"
import { useViewAs } from "@/context/ViewAsContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type AccessPreviewProps = {
  positions: BoardPosition[]
  disabled?: boolean
}

export function AccessPreview({ positions, disabled }: AccessPreviewProps) {
  const { viewAsPosition, setViewAsPosition } = useViewAs()

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: "var(--primary)" }}>
          Access preview
        </CardTitle>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          See the app as a specific role would. The nav and pages will show only
          what that position can access. Turn off when you are done checking.
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Select
          value={viewAsPosition?.id ?? "none"}
          onValueChange={(id) => {
            const pos = positions.find((p) => p.id === id)
            setViewAsPosition(pos ?? null)
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-[200px]" size="default">
            <SelectValue placeholder="View as..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">My own access</SelectItem>
            {positions.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {viewAsPosition && (
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={() => setViewAsPosition(null)}
            disabled={disabled}
          >
            Stop preview
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
