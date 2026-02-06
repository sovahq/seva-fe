"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Plus, ChevronDown, ChevronRight } from "lucide-react"
import type { BoardPosition } from "@/types"
import { APP_MODULES } from "@/lib/app-modules"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const ROOT_ID = "__root__"

type HierarchyBuilderProps = {
  positions: BoardPosition[]
  onPositionsChange: (positions: BoardPosition[]) => void
  organizationId: string
  disabled?: boolean
}

export function HierarchyBuilder({
  positions,
  onPositionsChange,
  organizationId,
  disabled,
}: HierarchyBuilderProps) {
  const [addingUnderId, setAddingUnderId] = useState<string | null>(null)
  const [inlineName, setInlineName] = useState("")
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())

  function addPositionUnder(parentId: string | null) {
    const name = inlineName.trim()
    if (!name) return
    const id = `pos-${Date.now()}`
    const moduleIds = positions[0]
      ? Object.keys(positions[0].moduleAccess)
      : APP_MODULES.map((m) => m.id)
    const moduleAccess: Record<string, "none" | "view" | "manage"> = {}
    moduleIds.forEach((m) => (moduleAccess[m] = "none"))
    const newPosition: BoardPosition = {
      id,
      organizationId,
      name,
      reportsToId: parentId === ROOT_ID ? null : parentId,
      moduleAccess,
    }
    onPositionsChange([...positions, newPosition])
    setInlineName("")
    setAddingUnderId(null)
  }

  function updatePosition(id: string, updates: Partial<BoardPosition>) {
    onPositionsChange(
      positions.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }

  function removePosition(id: string) {
    const updated = positions.filter((p) => p.id !== id)
    onPositionsChange(
      updated.map((p) =>
        p.reportsToId === id ? { ...p, reportsToId: null } : p
      )
    )
  }

  function toggleCollapsed(id: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function getChildren(parentId: string | null) {
    return positions.filter((p) => p.reportsToId === parentId)
  }

  function renderTreeNode(parentId: string | null, level: number): React.ReactNode {
    const children = getChildren(parentId)
    if (children.length === 0) return null

    return (
      <ul className="list-none space-y-0" role="tree" aria-label="Positions">
        {children.map((position) => {
          const childList = getChildren(position.id)
          const hasChildren = childList.length > 0
          const isCollapsed = collapsedIds.has(position.id)
          const isAddingHere = addingUnderId === position.id

          return (
            <li
              key={position.id}
              role="treeitem"
              aria-expanded={hasChildren ? !isCollapsed : undefined}
              className="py-0.5"
            >
              <div
                className="flex flex-col gap-1"
                style={{ marginLeft: level * 20 }}
              >
                <TreeNode
                  position={position}
                  hasChildren={hasChildren}
                  isCollapsed={isCollapsed}
                  onToggleCollapse={() => toggleCollapsed(position.id)}
                  onUpdate={updatePosition}
                  onRemove={removePosition}
                  onAddUnder={() => {
                    setAddingUnderId((prev) =>
                      prev === position.id ? null : position.id
                    )
                    setInlineName("")
                  }}
                  disabled={disabled}
                  isAddingUnder={isAddingHere}
                />
                {isAddingHere && (
                  <InlineAddForm
                    parentName={position.name}
                    value={inlineName}
                    onChange={setInlineName}
                    onSubmit={() => addPositionUnder(position.id)}
                    onCancel={() => {
                      setAddingUnderId(null)
                      setInlineName("")
                    }}
                    disabled={disabled}
                    className="ml-6"
                  />
                )}
                <AnimatePresence initial={false}>
                  {hasChildren && !isCollapsed && (
                    <motion.div
                      className="border-l border-border/60 pl-3 ml-2 overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                    >
                      {renderTreeNode(position.id, level + 1)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  const isAddingUnderRoot = addingUnderId === ROOT_ID

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: "var(--primary)" }}>
          Organizational hierarchy
        </CardTitle>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Click "Add under" on any node to add a position that reports to it.
          Expand or collapse branches with the arrow.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p
            className="mb-2 text-sm font-medium"
            style={{ color: "var(--muted-foreground)" }}
          >
            Positions
          </p>
          {positions.length === 0 && !isAddingUnderRoot ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-6 text-center">
              <p
                className="text-sm mb-3"
                style={{ color: "var(--muted-foreground)" }}
              >
                No positions yet. Add a top-level position to start.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddingUnderId(ROOT_ID)}
                disabled={disabled}
              >
                <Plus className="size-4 mr-1" />
                Add top-level position
              </Button>
            </div>
          ) : (
            <div className="space-y-0">
              {isAddingUnderRoot && (
                <InlineAddForm
                  parentName="(top level)"
                  value={inlineName}
                  onChange={setInlineName}
                  onSubmit={() => addPositionUnder(ROOT_ID)}
                  onCancel={() => {
                    setAddingUnderId(null)
                    setInlineName("")
                  }}
                  disabled={disabled}
                  className="mb-2"
                />
              )}
              {!isAddingUnderRoot && (
                <div className="mb-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAddingUnderId(ROOT_ID)}
                    disabled={disabled}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="size-4 mr-1" />
                    Add top-level position
                  </Button>
                </div>
              )}
              {renderTreeNode(null, 0)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function InlineAddForm({
  parentName,
  value,
  onChange,
  onSubmit,
  onCancel,
  disabled,
  className,
}: {
  parentName: string
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  onCancel: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2",
        className
      )}
    >
      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
        Under {parentName}:
      </span>
      <Input
        placeholder="Position name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-8 w-40"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            if (value.trim()) onSubmit()
          }
          if (e.key === "Escape") onCancel()
        }}
      />
      <Button
        type="button"
        size="xs"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
      >
        Add
      </Button>
      <Button type="button" variant="ghost" size="xs" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  )
}

function TreeNode({
  position,
  hasChildren,
  isCollapsed,
  onToggleCollapse,
  onUpdate,
  onRemove,
  onAddUnder,
  disabled,
  isAddingUnder,
}: {
  position: BoardPosition
  hasChildren: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
  onUpdate: (id: string, u: Partial<BoardPosition>) => void
  onRemove: (id: string) => void
  onAddUnder: () => void
  disabled?: boolean
  isAddingUnder: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(position.name)

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 group"
      )}
    >
      {hasChildren ? (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-0.5 rounded hover:bg-primary/10 -ml-0.5"
          aria-label={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? (
            <ChevronRight
              className="size-4"
              style={{ color: "var(--primary)" }}
            />
          ) : (
            <ChevronDown
              className="size-4"
              style={{ color: "var(--primary)" }}
            />
          )}
        </button>
      ) : (
        <span className="w-5 inline-block" aria-hidden />
      )}
      {editing ? (
        <>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 w-40"
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => {
              onUpdate(position.id, { name: name.trim() || position.name })
              setEditing(false)
            }}
            disabled={disabled}
          >
            Save
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              setName(position.name)
              setEditing(false)
            }}
          >
            Cancel
          </Button>
        </>
      ) : (
        <>
          <span className="font-medium" style={{ color: "var(--primary)" }}>
            {position.name}
          </span>
          {!disabled && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setEditing(true)}
                className="opacity-70 group-hover:opacity-100"
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={onAddUnder}
                className="opacity-70 group-hover:opacity-100"
              >
                <Plus className="size-3 mr-0.5" />
                Add under
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onRemove(position.id)}
                style={{ color: "var(--destructive)" }}
                className="opacity-70 group-hover:opacity-100"
              >
                Remove
              </Button>
            </>
          )}
        </>
      )}
    </div>
  )
}
