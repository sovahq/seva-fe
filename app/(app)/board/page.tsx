"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useAuth } from "@/context/AuthContext"
import { mockBoardPositions, mockBoardAssignments } from "@/data/mock"
import {
  AccessPreview,
  HierarchyBuilder,
  MemberAssignment,
  PermissionsMatrix,
} from "@/components/board"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type TabId = "hierarchy" | "permissions" | "assignments" | "preview"

const TABS: { id: TabId; label: string }[] = [
  { id: "hierarchy", label: "Hierarchy" },
  { id: "permissions", label: "Permissions" },
  { id: "assignments", label: "Assignments" },
  { id: "preview", label: "Access preview" },
]

export default function BoardPage() {
  const { currentUser, currentOrganizationId, availableUsers } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>("hierarchy")

  const orgId = currentOrganizationId ?? ""

  const [positions, setPositions] = useState(() =>
    mockBoardPositions.filter((p) => p.organizationId === orgId)
  )
  const [assignments, setAssignments] = useState(() =>
    mockBoardAssignments.filter((a) => a.organizationId === orgId)
  )

  const isPresident = currentUser?.role === "admin"
  const canEdit = isPresident

  if (!currentUser) return null

  if (!isPresident) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
          Board
        </h1>
        <p className="mt-1" style={{ color: "var(--muted-foreground)" }}>
          Board and leadership.
        </p>
        <Card className="mt-6">
          <CardContent className="py-6">
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Only the President can set up board positions and permissions. If
              you need access changed, ask your President or an admin.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
        Board setup
      </h1>
      <p className="mt-1" style={{ color: "var(--muted-foreground)" }}>
        Define positions, who reports to whom, and what each role can access.
      </p>

      <nav
        className="mt-6 flex flex-wrap gap-1 rounded-xl border border-border/60 bg-card p-1"
        aria-label="Board setup sections"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary/15"
                : "hover:bg-primary/10"
            )}
            style={{
              color: activeTab === tab.id ? "var(--primary)" : "rgba(0,45,91,0.8)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === "hierarchy" && (
            <motion.div
              key="hierarchy"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <HierarchyBuilder
                positions={positions}
                onPositionsChange={setPositions}
                organizationId={orgId}
                disabled={!canEdit}
              />
            </motion.div>
          )}
          {activeTab === "permissions" && (
            <motion.div
              key="permissions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <PermissionsMatrix
                positions={positions}
                onPositionsChange={setPositions}
                disabled={!canEdit}
              />
            </motion.div>
          )}
          {activeTab === "assignments" && (
            <motion.div
              key="assignments"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <MemberAssignment
                positions={positions}
                assignments={assignments}
                onAssignmentsChange={setAssignments}
                users={availableUsers}
                organizationId={orgId}
                disabled={!canEdit}
              />
            </motion.div>
          )}
          {activeTab === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <AccessPreview positions={positions} disabled={!canEdit} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
