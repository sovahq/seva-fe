"use client"

import type { AccessLevel, BoardPosition } from "@/types"
import { APP_MODULES } from "@/lib/app-modules"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type PermissionsMatrixProps = {
  positions: BoardPosition[]
  onPositionsChange: (positions: BoardPosition[]) => void
  disabled?: boolean
}

const ACCESS_OPTIONS: { value: AccessLevel; label: string }[] = [
  { value: "none", label: "None" },
  { value: "view", label: "View" },
  { value: "manage", label: "Manage" },
]

export function PermissionsMatrix({
  positions,
  onPositionsChange,
  disabled,
}: PermissionsMatrixProps) {
  function updateAccess(
    positionId: string,
    moduleId: string,
    level: AccessLevel
  ) {
    onPositionsChange(
      positions.map((p) =>
        p.id === positionId
          ? {
              ...p,
              moduleAccess: {
                ...p.moduleAccess,
                [moduleId]: level,
              },
            }
          : p
      )
    )
  }

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle style={{ color: "var(--primary)" }}>
            Module access
          </CardTitle>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Define what each position can see and change. Add positions in the
            Hierarchy tab first.
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            No positions yet. Add positions in the Hierarchy tab to set their
            access here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: "var(--primary)" }}>
          Module access
        </CardTitle>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Set access per position and module. View means they can see the area;
          Manage means they can create and edit.
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[500px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th
                className="py-3 pr-4 text-left font-medium"
                style={{ color: "var(--primary)" }}
              >
                Position
              </th>
              {APP_MODULES.map((mod) => (
                <th
                  key={mod.id}
                  className="px-2 py-3 text-center font-medium"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {mod.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => (
              <tr
                key={pos.id}
                className="border-b border-border/50"
              >
                <td className="py-2 pr-4 font-medium" style={{ color: "var(--primary)" }}>
                  {pos.name}
                </td>
                {APP_MODULES.map((mod) => {
                  const value = (pos.moduleAccess[mod.id] ?? "none") as AccessLevel
                  return (
                    <td key={mod.id} className="px-2 py-2">
                      <Select
                        value={value}
                        onValueChange={(v) =>
                          updateAccess(pos.id, mod.id, v as AccessLevel)
                        }
                        disabled={disabled}
                      >
                        <SelectTrigger
                          size="sm"
                          className="w-full min-w-[90px]"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACCESS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
