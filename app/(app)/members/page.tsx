"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  mockMembers,
  mockEvents,
  mockAttendanceRecords,
  mockInductionProspects,
  mockMemberDues,
  INDUCTION_CHECKLIST,
} from "@/data/mock"
import { useAuth } from "@/context/AuthContext"
import { canManage } from "@/lib/permissions"
import {
  getLastAttendanceDate,
  getMemberHealthStatus,
} from "@/lib/member-engagement"
import type {
  Member,
  Event,
  AttendanceRecord,
  InductionProspect,
  InductionStage,
  MemberHealthStatus,
} from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  Search,
  Download,
  Users,
  CalendarCheck,
  Kanban,
  Mail,
  Phone,
} from "lucide-react"

type MembersTab = "directory" | "engagement" | "induction"

const INDUCTION_STAGES: { id: InductionStage; label: string }[] = [
  { id: "prospect", label: "Prospect" },
  { id: "orientation", label: "Orientation" },
  { id: "dues_paid", label: "Dues Paid" },
  { id: "inducted", label: "Inducted" },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" })
}

function healthLabel(s: MemberHealthStatus): string {
  const map: Record<MemberHealthStatus, string> = {
    active: "Active",
    at_risk: "At risk",
    inactive: "Inactive",
  }
  return map[s] ?? s
}

export default function MembersPage() {
  const { currentOrganizationId, currentUser } = useAuth()
  const orgId = currentOrganizationId ?? ""
  const canManageMembership = currentUser ? canManage(currentUser.role, "membership") : false

  const [activeTab, setActiveTab] = useState<MembersTab>("directory")
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const initialProspects = useMemo(
    () => mockInductionProspects.filter((p) => p.organizationId === orgId),
    [orgId]
  )
  const [prospects, setProspects] = useState<InductionProspect[]>(initialProspects)
  useEffect(() => {
    setProspects(initialProspects)
  }, [initialProspects])

  const members = useMemo(
    () => mockMembers.filter((m) => m.organizationId === orgId && !m.id.startsWith("m-demo")),
    [orgId]
  )
  const events = useMemo(
    () => mockEvents.filter((e) => e.organizationId === orgId),
    [orgId]
  )
  const attendance = useMemo(
    () => mockAttendanceRecords.filter((a) => a.organizationId === orgId),
    [orgId]
  )
  const dues = useMemo(
    () => mockMemberDues.filter((d) => d.organizationId === orgId),
    [orgId]
  )

  const tabs: { id: MembersTab; label: string; icon: React.ReactNode }[] = [
    { id: "directory", label: "Directory", icon: <Users className="size-4" /> },
    { id: "engagement", label: "Engagement", icon: <CalendarCheck className="size-4" /> },
    { id: "induction", label: "Induction", icon: <Kanban className="size-4" /> },
  ]

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
            Member Relations
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Member directory, engagement, and induction pipeline.
          </p>
        </div>
      </div>

      <nav
        className="mt-4 flex gap-1 overflow-x-auto rounded-xl bg-muted/40 p-1 pb-2 sm:pb-1"
        aria-label="Member Relations sections"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id ? "bg-card shadow-sm" : "hover:bg-primary/5"
            )}
            style={{
              color: activeTab === tab.id ? "var(--primary)" : "var(--muted-foreground)",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="mt-4">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === "directory" && (
            <motion.div
              key="directory"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <DirectoryTab
                members={members}
                canManageMembership={canManageMembership}
                selectedMemberId={selectedMemberId}
                onSelectMember={setSelectedMemberId}
                onExportRoster={canManageMembership ? () => exportRoster(members) : undefined}
              />
            </motion.div>
          )}
          {activeTab === "engagement" && (
            <motion.div
              key="engagement"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <EngagementTab
                members={members}
                events={events}
                attendance={attendance}
                canManageMembership={canManageMembership}
              />
            </motion.div>
          )}
          {activeTab === "induction" && (
            <motion.div
              key="induction"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <InductionTab
                prospects={prospects}
                onProspectsChange={setProspects}
                checklist={INDUCTION_CHECKLIST}
                stages={INDUCTION_STAGES}
                dues={dues}
                canManageMembership={canManageMembership}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function exportRoster(members: Member[]) {
  const headers = ["Name", "Role", "Email", "Join date", "Committees", "Skills"]
  const rows = members.map((m) => [
    m.name,
    m.role ?? "",
    m.email ?? "",
    m.joinDate ?? "",
    (m.committeeAssignments ?? []).join("; "),
    (m.skills ?? []).join("; "),
  ])
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `membership-roster-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function DirectoryTab({
  members,
  canManageMembership,
  selectedMemberId,
  onSelectMember,
  onExportRoster,
}: {
  members: Member[]
  canManageMembership: boolean
  selectedMemberId: string | null
  onSelectMember: (id: string | null) => void
  onExportRoster?: () => void
}) {
  const [search, setSearch] = useState("")
  const [skillFilter, setSkillFilter] = useState<string>("")

  const allSkills = useMemo(() => {
    const set = new Set<string>()
    members.forEach((m) => (m.skills ?? []).forEach((s) => set.add(s)))
    return Array.from(set).sort()
  }, [members])

  const filtered = useMemo(() => {
    let list = members
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.email?.toLowerCase().includes(q)) ||
          (m.role?.toLowerCase().includes(q)) ||
          (m.skills?.some((s) => s.toLowerCase().includes(q))) ||
          (m.committeeAssignments?.some((c) => c.toLowerCase().includes(q)))
      )
    }
    if (skillFilter) {
      list = list.filter((m) => (m.skills ?? []).includes(skillFilter))
    }
    return list
  }, [members, search, skillFilter])

  const selectedMember = selectedMemberId ? members.find((m) => m.id === selectedMemberId) : null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
          <Input
            placeholder="Search by name, role, skill, or committee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={skillFilter || "__all__"} onValueChange={(v) => setSkillFilter(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-[180px]" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            <SelectValue placeholder="All skills" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All skills</SelectItem>
            {allSkills.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {onExportRoster && (
          <Button variant="outline" size="sm" onClick={onExportRoster} className="gap-1.5">
            <Download className="size-4" />
            Export roster
          </Button>
        )}
      </div>

      <div className="flex gap-4">
        <Card className="flex-1 min-w-0">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3" style={{ color: "var(--primary)" }}>
              Member directory
            </h3>
            {filtered.length === 0 ? (
              <p className="text-sm py-4" style={{ color: "var(--muted-foreground)" }}>
                No members match your search.
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {filtered.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => onSelectMember(selectedMemberId === m.id ? null : m.id)}
                      className={cn(
                        "w-full text-left py-3 px-2 -mx-2 rounded-lg transition-colors",
                        selectedMemberId === m.id ? "bg-primary/10" : "hover:bg-muted/50"
                      )}
                    >
                      <p className="font-medium text-sm" style={{ color: "var(--primary)" }}>
                        {m.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {m.role ?? "Member"}
                        {m.committeeAssignments?.length ? ` · ${m.committeeAssignments.join(", ")}` : ""}
                      </p>
                      {(m.skills?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(m.skills ?? []).map((s) => (
                            <Badge key={s} variant="secondary" className="text-[10px] font-normal">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {selectedMember && (
          <Card className="w-80 shrink-0">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
                  Profile
                </h3>
                <Button variant="ghost" size="sm" onClick={() => onSelectMember(null)}>
                  Close
                </Button>
              </div>
              <div className="mt-3 space-y-3 text-sm">
                {selectedMember.role && (
                  <p><span className="font-medium" style={{ color: "var(--muted-foreground)" }}>Role:</span> {selectedMember.role}</p>
                )}
                {selectedMember.joinDate && (
                  <p><span className="font-medium" style={{ color: "var(--muted-foreground)" }}>Join date:</span> {formatDate(selectedMember.joinDate)}</p>
                )}
                {(selectedMember.committeeAssignments?.length ?? 0) > 0 && (
                  <p><span className="font-medium" style={{ color: "var(--muted-foreground)" }}>Committees:</span> {selectedMember.committeeAssignments!.join(", ")}</p>
                )}
                {(selectedMember.skills?.length ?? 0) > 0 && (
                  <div>
                    <p className="font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedMember.skills!.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs font-normal">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {canManageMembership && (
                  <>
                    {selectedMember.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="size-3.5" style={{ color: "var(--muted-foreground)" }} />
                        {selectedMember.email}
                      </p>
                    )}
                    {selectedMember.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="size-3.5" style={{ color: "var(--muted-foreground)" }} />
                        {selectedMember.phone}
                      </p>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function EngagementTab({
  members,
  events,
  attendance,
  canManageMembership,
}: {
  members: Member[]
  events: Event[]
  attendance: AttendanceRecord[]
  canManageMembership: boolean
}) {
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState(false)
  const [localAttendance, setLocalAttendance] = useState<AttendanceRecord[]>([])

  const eventOptions = useMemo(() => events.filter((e) => e.organizationId), [events])
  const allAttendance = useMemo(() => [...attendance, ...localAttendance], [attendance, localAttendance])
  const lastAttendanceByMember = useMemo(() => {
    const map = new Map<string, string | null>()
    members.forEach((m) => map.set(m.id, getLastAttendanceDate(m.id, allAttendance)))
    return map
  }, [members, allAttendance])
  const healthByMember = useMemo(() => {
    const map = new Map<string, MemberHealthStatus>()
    members.forEach((m) => {
      const last = lastAttendanceByMember.get(m.id) ?? null
      map.set(m.id, getMemberHealthStatus(last))
    })
    return map
  }, [members, lastAttendanceByMember])

  function togglePresent(memberId: string) {
    setPresentIds((prev) => {
      const next = new Set(prev)
      if (next.has(memberId)) next.delete(memberId)
      else next.add(memberId)
      return next
    })
    setSaved(false)
  }

  function saveAttendance() {
    if (!selectedEventId) return
    const now = new Date().toISOString()
    const newRecords: AttendanceRecord[] = Array.from(presentIds).map((memberId, i) => ({
      id: `local-att-${Date.now()}-${i}`,
      organizationId: members[0]?.organizationId ?? "",
      eventId: selectedEventId,
      memberId,
      recordedAt: now,
    }))
    setLocalAttendance((prev) => [...prev, ...newRecords])
    setPresentIds(new Set())
    setSaved(true)
  }

  return (
    <div className="space-y-6">
      {canManageMembership && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3" style={{ color: "var(--primary)" }}>
              Attendance logger
            </h3>
            <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
              Select an event and mark who attended. Save to record.
            </p>
            <div className="flex flex-wrap gap-2 items-end">
              <div className="min-w-[200px]">
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Event
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full rounded-lg border bg-card px-3 py-2 text-sm"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  <option value="">Select event</option>
                  {eventOptions.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.date})</option>
                  ))}
                </select>
              </div>
              <Button size="sm" onClick={saveAttendance} disabled={!selectedEventId}>
                Save attendance
              </Button>
              {saved && (
                <span className="text-xs self-center" style={{ color: "var(--muted-foreground)" }}>
                  Saved.
                </span>
              )}
            </div>
            {selectedEventId && (
              <ul className="mt-3 grid gap-1 sm:grid-cols-2 max-h-48 overflow-y-auto">
                {members.map((m) => (
                  <li key={m.id}>
                    <label className="flex items-center gap-2 cursor-pointer py-1 text-sm">
                      <input
                        type="checkbox"
                        checked={presentIds.has(m.id)}
                        onChange={() => togglePresent(m.id)}
                        className="rounded border-border"
                      />
                      {m.name}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-1" style={{ color: "var(--primary)" }}>
            Member health status
          </h3>
          <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
            Based on attendance in the last 3 months (active), 3 to 6 months (at risk), or 6+ months or never (inactive).
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs">
              <span className="size-2.5 rounded-full bg-emerald-500" aria-hidden />
              Active
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs">
              <span className="size-2.5 rounded-full bg-amber-500" aria-hidden />
              At risk
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs">
              <span className="size-2.5 rounded-full bg-red-500/80" aria-hidden />
              Inactive
            </span>
          </div>
          <ul className="divide-y divide-border/60">
            {members.map((m) => {
              const status = healthByMember.get(m.id) ?? "inactive"
              const lastAt = lastAttendanceByMember.get(m.id)
              return (
                <li key={m.id} className="py-2 flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-medium text-sm">{m.name}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {lastAt ? `Last attended: ${formatDate(lastAt)}` : "No attendance recorded"}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0",
                      status === "active" && "border-emerald-500/50 text-emerald-700 bg-emerald-500/10",
                      status === "at_risk" && "border-amber-500/50 text-amber-700 bg-amber-500/10",
                      status === "inactive" && "border-red-500/30 text-red-700 bg-red-500/10"
                    )}
                  >
                    {healthLabel(status)}
                  </Badge>
                </li>
              )
            })}
          </ul>
          <p className="text-xs mt-4 pt-3 border-t border-border/60" style={{ color: "var(--muted-foreground)" }}>
            Reaching out to inactive members? A quick check-in can help them feel connected again.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function InductionTab({
  prospects,
  onProspectsChange,
  checklist,
  stages,
  dues,
  canManageMembership,
}: {
  prospects: InductionProspect[]
  onProspectsChange: (next: InductionProspect[]) => void
  checklist: typeof INDUCTION_CHECKLIST
  stages: { id: InductionStage; label: string }[]
  dues: { memberId: string; memberName: string; status: string }[]
  canManageMembership: boolean
}) {
  const prospectsByStage = useMemo(() => {
    const map = new Map<InductionStage, InductionProspect[]>()
    stages.forEach((s) => map.set(s.id, []))
    prospects.forEach((p) => {
      const list = map.get(p.stage) ?? []
      list.push(p)
      map.set(p.stage, list)
    })
    return map
  }, [prospects, stages])

  const duesPaidMemberIds = useMemo(() => new Set(dues.filter((d) => d.status === "paid").map((d) => d.memberId)), [dues])
  const duesPaidNames = useMemo(() => new Set(dues.filter((d) => d.status === "paid").map((d) => d.memberName.trim().toLowerCase())), [dues])

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        Move prospects through: Prospect → Orientation → Dues Paid → Inducted. Dues Paid is aligned with Finance when a member has paid.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => (
          <Card key={stage.id}>
            <CardContent className="p-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--muted-foreground)" }}>
                {stage.label}
              </h3>
              <ul className="space-y-2">
                {(prospectsByStage.get(stage.id) ?? []).map((p) => (
                  <InductionCard
                    key={p.id}
                    prospect={p}
                    stageChecklist={checklist.filter((c) => c.stage === stage.id)}
                    isDuesPaidFromFinance={
                      (p.memberId && duesPaidMemberIds.has(p.memberId)) ||
                      duesPaidNames.has(p.name.trim().toLowerCase())
                    }
                    canManage={canManageMembership}
                    stageOrder={stages.map((s) => s.id)}
                    onMoveStage={
                      canManageMembership
                        ? (prospectId, nextStage) => {
                            const now = new Date().toISOString()
                            onProspectsChange(
                              prospects.map((q) =>
                                q.id === prospectId
                                  ? { ...q, stage: nextStage, stageMovedAt: now }
                                  : q
                              )
                            )
                          }
                        : undefined
                    }
                  />
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function InductionCard({
  prospect,
  stageChecklist,
  isDuesPaidFromFinance,
  canManage,
  stageOrder,
  onMoveStage,
}: {
  prospect: InductionProspect
  stageChecklist: { key: string; label: string; required: boolean }[]
  isDuesPaidFromFinance: boolean
  canManage: boolean
  stageOrder: InductionStage[]
  onMoveStage?: (prospectId: string, nextStage: InductionStage) => void
}) {
  const currentIndex = stageOrder.indexOf(prospect.stage)
  const nextStage = currentIndex < stageOrder.length - 1 ? stageOrder[currentIndex + 1] : null
  const nextStageLabel = nextStage && INDUCTION_STAGES.find((s) => s.id === nextStage)?.label

  return (
    <li className="rounded-lg border p-2 text-sm" style={{ borderColor: "var(--border)" }}>
      <p className="font-medium" style={{ color: "var(--primary)" }}>
        {prospect.name}
      </p>
      <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
        {prospect.email}
      </p>
      {stageChecklist.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs">
          {stageChecklist.map((item) => {
            const done = prospect.checklistCompleted[item.key]
            return (
              <li key={item.key} className="flex items-center gap-1.5">
                {done ? (
                  <span className="text-emerald-600" aria-hidden>✓</span>
                ) : (
                  <span className="text-muted-foreground" aria-hidden>○</span>
                )}
                {item.label}
                {item.key === "dues_received" && isDuesPaidFromFinance && (
                  <Badge variant="secondary" className="text-[10px] ml-1">Finance</Badge>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {canManage && nextStage && nextStageLabel && onMoveStage && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full text-xs"
          onClick={() => onMoveStage(prospect.id, nextStage)}
        >
          Move to {nextStageLabel}
        </Button>
      )}
    </li>
  )
}
