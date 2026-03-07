"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import {
  mockMembers,
  mockInductionProspects,
  mockMemberDues,
  INDUCTION_CHECKLIST,
  REQUIRED_PARTICIPATION_MEETINGS,
} from "@/data/mock"
import { useAuth } from "@/context/AuthContext"
import { useMeetings } from "@/context/MeetingsContext"
import { canManage } from "@/lib/permissions"
import { ROUTES } from "@/routes/routenames"
import {
  getLastAttendanceDate,
  getMemberHealthStatus,
} from "@/lib/member-engagement"
import type {
  Member,
  Meeting,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Search,
  Download,
  Users,
  CalendarCheck,
  Kanban,
  Mail,
  Phone,
  Check,
  Circle,
  AlertCircle,
  Award,
} from "lucide-react"

type MembersTab = "directory" | "engagement" | "induction"

const INDUCTION_STAGES: { id: InductionStage; label: string }[] = [
  { id: "prospect", label: "Prospect" },
  { id: "orientation", label: "Orientation" },
  { id: "dues_paid", label: "Dues Paid" },
  { id: "inducted", label: "Inducted" },
]

type InductionView = "pipeline" | "ready"

type GateStatus = { finance: boolean; participation: boolean; orientation: boolean; profile: boolean }

function getGateStatus(
  prospect: InductionProspect,
  duesPaidMemberIds: Set<string>,
  duesPaidNames: Set<string>
): GateStatus {
  const finance =
    (prospect.memberId && duesPaidMemberIds.has(prospect.memberId)) ||
    duesPaidNames.has(prospect.name.trim().toLowerCase())
  const participation = (prospect.participationCount ?? 0) >= REQUIRED_PARTICIPATION_MEETINGS
  const orientation = prospect.orientationVerified === true
  const profile = prospect.profileComplete === true
  return { finance, participation, orientation, profile }
}

function countGates(g: GateStatus): number {
  return [g.finance, g.participation, g.orientation, g.profile].filter(Boolean).length
}

function isEligibleForInduction(prospect: InductionProspect, gates: GateStatus): boolean {
  return (
    prospect.stage === "dues_paid" &&
    gates.finance &&
    gates.participation &&
    gates.orientation &&
    gates.profile
  )
}

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
  const router = useRouter()
  const { currentOrganizationId, currentUser } = useAuth()
  const { meetings, attendance, addAttendanceRecord } = useMeetings()
  const orgId = currentOrganizationId ?? ""
  const canManageMembership = currentUser ? canManage(currentUser.role, "membership") : false

  useEffect(() => {
    if (currentUser?.role === "member") {
      router.replace(ROUTES.DASHBOARD)
    }
  }, [currentUser?.role, router])

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
  const orgMeetings = useMemo(
    () => meetings.filter((m) => m.organizationId === orgId),
    [meetings, orgId]
  )
  const orgAttendance = useMemo(
    () => attendance.filter((a) => a.organizationId === orgId),
    [attendance, orgId]
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

  if (currentUser?.role === "member") {
    return null
  }

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
                meetings={orgMeetings}
                attendance={orgAttendance}
                addAttendanceRecord={addAttendanceRecord}
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
  meetings,
  attendance,
  canManageMembership,
  addAttendanceRecord,
}: {
  members: Member[]
  meetings: Meeting[]
  attendance: AttendanceRecord[]
  canManageMembership: boolean
  addAttendanceRecord: (record: AttendanceRecord) => void
}) {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("")
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState(false)
  const [localAttendance, setLocalAttendance] = useState<AttendanceRecord[]>([])

  const meetingOptions = useMemo(() => meetings.filter((m) => m.organizationId), [meetings])
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
  const healthChartData = useMemo(() => {
    const counts = { active: 0, at_risk: 0, inactive: 0 }
    healthByMember.forEach((status) => {
      counts[status] = (counts[status] ?? 0) + 1
    })
    return [
      { name: "Active", count: counts.active, fill: "var(--chart-active, #10b981)" },
      { name: "At risk", count: counts.at_risk, fill: "var(--chart-warning, #f59e0b)" },
      { name: "Inactive", count: counts.inactive, fill: "var(--chart-inactive, #ef4444)" },
    ]
  }, [healthByMember])

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
    if (!selectedMeetingId) return
    const now = new Date().toISOString()
    const orgId = members[0]?.organizationId ?? ""
    const newRecords: AttendanceRecord[] = Array.from(presentIds).map((memberId, i) => ({
      id: `local-att-${Date.now()}-${i}`,
      organizationId: orgId,
      meetingId: selectedMeetingId,
      memberId,
      recordedAt: now,
    }))
    newRecords.forEach(addAttendanceRecord)
    setLocalAttendance([])
    setPresentIds(new Set())
    setSaved(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-3" style={{ color: "var(--primary)" }}>
            Member health distribution
          </p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} labelStyle={{ color: "var(--primary)" }} />
                <Bar dataKey="count" name="Members" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      {canManageMembership && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3" style={{ color: "var(--primary)" }}>
              Attendance logger
            </h3>
            <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
              Select a meeting and mark who attended. Save to record.
            </p>
            <div className="flex flex-wrap gap-2 items-end">
              <div className="min-w-[200px]">
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Meeting
                </label>
                <select
                  value={selectedMeetingId}
                  onChange={(e) => setSelectedMeetingId(e.target.value)}
                  className="w-full rounded-lg border bg-card px-3 py-2 text-sm"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  <option value="">Select meeting</option>
                  {meetingOptions.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.date})</option>
                  ))}
                </select>
              </div>
              <Button size="sm" onClick={saveAttendance} disabled={!selectedMeetingId}>
                Save attendance
              </Button>
              {saved && (
                <span className="text-xs self-center" style={{ color: "var(--muted-foreground)" }}>
                  Saved.
                </span>
              )}
            </div>
            {selectedMeetingId && (
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
  const [inductionView, setInductionView] = useState<InductionView>("pipeline")
  const [selectedForInduction, setSelectedForInduction] = useState<Set<string>>(new Set())
  const [ceremonyOpen, setCeremonyOpen] = useState(false)
  const [inductionClassName, setInductionClassName] = useState("")
  const [ceremonySuccess, setCeremonySuccess] = useState(false)

  const duesPaidMemberIds = useMemo(
    () => new Set(dues.filter((d) => d.status === "paid").map((d) => d.memberId)),
    [dues]
  )
  const duesPaidNames = useMemo(
    () => new Set(dues.filter((d) => d.status === "paid").map((d) => d.memberName.trim().toLowerCase())),
    [dues]
  )

  const gateStatusByProspect = useMemo(() => {
    const map = new Map<string, GateStatus>()
    prospects.forEach((p) => map.set(p.id, getGateStatus(p, duesPaidMemberIds, duesPaidNames)))
    return map
  }, [prospects, duesPaidMemberIds, duesPaidNames])

  const pipelineBuckets = useMemo(() => {
    const started: InductionProspect[] = []
    const midway: InductionProspect[] = []
    const ready: InductionProspect[] = []
    const inducted: InductionProspect[] = []
    prospects.forEach((p) => {
      if (p.stage === "inducted") {
        inducted.push(p)
        return
      }
      const gates = gateStatusByProspect.get(p.id) ?? { finance: false, participation: false, orientation: false, profile: false }
      const n = countGates(gates)
      if (n >= 4 && p.stage === "dues_paid") ready.push(p)
      else if (n >= 2) midway.push(p)
      else started.push(p)
    })
    return { started, midway, ready, inducted }
  }, [prospects, gateStatusByProspect])

  const eligibleForInduction = useMemo(
    () =>
      prospects.filter((p) => {
        const gates = gateStatusByProspect.get(p.id) ?? { finance: false, participation: false, orientation: false, profile: false }
        return isEligibleForInduction(p, gates)
      }),
    [prospects, gateStatusByProspect]
  )

  function updateProspect(prospectId: string, patch: Partial<InductionProspect>) {
    onProspectsChange(
      prospects.map((q) => (q.id === prospectId ? { ...q, ...patch } : q))
    )
  }

  function runInductionCeremony() {
    const name = inductionClassName.trim() || "Induction Class " + new Date().getFullYear()
    const now = new Date().toISOString()
    const ids = new Set(selectedForInduction)
    onProspectsChange(
      prospects.map((p) => {
        if (!ids.has(p.id)) return p
        return {
          ...p,
          stage: "inducted" as const,
          stageMovedAt: now,
          memberId: p.memberId || `m-ind-${p.id}`,
          inductionDate: now,
          inductionClass: name,
          checklistCompleted: {
            ...p.checklistCompleted,
            ceremony_completed: true,
            member_record_created: true,
          },
        }
      })
    )
    setCeremonyOpen(false)
    setInductionClassName("")
    setSelectedForInduction(new Set())
    setCeremonySuccess(true)
    setInductionView("pipeline")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setInductionView("pipeline")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            inductionView === "pipeline" ? "bg-primary/15" : "hover:bg-muted/60"
          )}
          style={{ color: inductionView === "pipeline" ? "var(--primary)" : "var(--muted-foreground)" }}
        >
          Pipeline
        </button>
        <button
          type="button"
          onClick={() => setInductionView("ready")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            inductionView === "ready" ? "bg-primary/15" : "hover:bg-muted/60"
          )}
          style={{ color: inductionView === "ready" ? "var(--primary)" : "var(--muted-foreground)" }}
        >
          Ready to Induct
        </button>
      </div>

      {ceremonySuccess && (
        <div
          className="flex items-center gap-3 rounded-xl border p-4"
          style={{ borderColor: "var(--primary)", backgroundColor: "var(--primary)/8" }}
        >
          <Award className="size-8 shrink-0" style={{ color: "var(--primary)" }} />
          <div>
            <p className="font-medium" style={{ color: "var(--primary)" }}>
              Induction complete
            </p>
            <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Congratulations to the new members. They are now part of the chapter.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setCeremonySuccess(false)}>
            Dismiss
          </Button>
        </div>
      )}

      {inductionView === "pipeline" && (
        <>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Prospects are grouped by how many induction gates they have completed: Finance (dues paid), Participation (meetings attended), Orientation (training confirmed), and Profile (complete).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--muted-foreground)" }}>
                  Started
                </h3>
                <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>
                  0 or 1 gate complete
                </p>
                <ul className="space-y-2">
                  {pipelineBuckets.started.map((p) => (
                    <MilestoneProgressCard
                      key={p.id}
                      prospect={p}
                      gates={gateStatusByProspect.get(p.id)!}
                      canManage={canManageMembership}
                      onUpdateProspect={updateProspect}
                    />
                  ))}
                  {pipelineBuckets.started.length === 0 && (
                    <li className="text-xs py-2" style={{ color: "var(--muted-foreground)" }}>None</li>
                  )}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--muted-foreground)" }}>
                  Midway
                </h3>
                <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>
                  2 or 3 gates complete
                </p>
                <ul className="space-y-2">
                  {pipelineBuckets.midway.map((p) => (
                    <MilestoneProgressCard
                      key={p.id}
                      prospect={p}
                      gates={gateStatusByProspect.get(p.id)!}
                      canManage={canManageMembership}
                      onUpdateProspect={updateProspect}
                    />
                  ))}
                  {pipelineBuckets.midway.length === 0 && (
                    <li className="text-xs py-2" style={{ color: "var(--muted-foreground)" }}>None</li>
                  )}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--muted-foreground)" }}>
                  Ready for Induction
                </h3>
                <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>
                  All 4 gates complete
                </p>
                <ul className="space-y-2">
                  {pipelineBuckets.ready.map((p) => (
                    <MilestoneProgressCard
                      key={p.id}
                      prospect={p}
                      gates={gateStatusByProspect.get(p.id)!}
                      canManage={canManageMembership}
                      onUpdateProspect={updateProspect}
                    />
                  ))}
                  {pipelineBuckets.ready.length === 0 && (
                    <li className="text-xs py-2" style={{ color: "var(--muted-foreground)" }}>None</li>
                  )}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--muted-foreground)" }}>
                  Inducted
                </h3>
                <ul className="space-y-2">
                  {pipelineBuckets.inducted.map((p) => (
                    <MilestoneProgressCard
                      key={p.id}
                      prospect={p}
                      gates={gateStatusByProspect.get(p.id)!}
                      canManage={false}
                      onUpdateProspect={updateProspect}
                    />
                  ))}
                  {pipelineBuckets.inducted.length === 0 && (
                    <li className="text-xs py-2" style={{ color: "var(--muted-foreground)" }}>None</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {inductionView === "ready" && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-1" style={{ color: "var(--primary)" }}>
              Ready for Swearing-in
            </h3>
            <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>
              Select prospects who have passed all gates, then run the Induction Ceremony to confirm them as members.
            </p>
            {eligibleForInduction.length === 0 ? (
              <p className="text-sm py-4" style={{ color: "var(--muted-foreground)" }}>
                No prospects are eligible yet. Complete all four gates (Finance, Participation, Orientation, Profile) for prospects in the Dues Paid stage.
              </p>
            ) : (
              <>
                <ul className="space-y-2 mb-4">
                  {eligibleForInduction.map((p) => (
                    <li
                      key={p.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3",
                        selectedForInduction.has(p.id) && "border-primary/50 bg-primary/5"
                      )}
                      style={{ borderColor: "var(--border)" }}
                    >
                      {canManageMembership && (
                        <input
                          type="checkbox"
                          checked={selectedForInduction.has(p.id)}
                          onChange={() => {
                            setSelectedForInduction((prev) => {
                              const next = new Set(prev)
                              if (next.has(p.id)) next.delete(p.id)
                              else next.add(p.id)
                              return next
                            })
                          }}
                          className="rounded border-border"
                          aria-label={`Select ${p.name} for induction`}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{p.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                {canManageMembership && (
                  <Button
                    onClick={() => setCeremonyOpen(true)}
                    disabled={selectedForInduction.size === 0}
                    className="gap-2"
                  >
                    <Award className="size-4" />
                    Induction Ceremony
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={ceremonyOpen} onOpenChange={setCeremonyOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Induction Ceremony</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm the selected prospects as full members. You can give this induction batch a class name (e.g. "The Resilience Class 2026").
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="induction-class">Induction class name</Label>
            <Input
              id="induction-class"
              placeholder="e.g. The Resilience Class 2026"
              value={inductionClassName}
              onChange={(e) => setInductionClassName(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={runInductionCeremony}>
              Confirm induction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function GateIndicator({
  complete,
  label,
  pendingLabel,
}: {
  complete: boolean
  label: string
  pendingLabel: string
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs"
      title={complete ? label : pendingLabel}
    >
      {complete ? (
        <Check className="size-3.5 text-emerald-600 shrink-0" aria-hidden />
      ) : (
        <span className="size-3.5 rounded-full border shrink-0" style={{ borderColor: "var(--muted-foreground)", backgroundColor: "var(--muted)" }} aria-hidden />
      )}
      <span style={{ color: complete ? "var(--foreground)" : "var(--muted-foreground)" }}>
        {complete ? label : pendingLabel}
      </span>
    </span>
  )
}

function MilestoneProgressCard({
  prospect,
  gates,
  canManage,
  onUpdateProspect,
}: {
  prospect: InductionProspect
  gates: GateStatus
  canManage: boolean
  onUpdateProspect: (id: string, patch: Partial<InductionProspect>) => void
}) {
  const count = prospect.participationCount ?? 0
  const participationMet = count >= REQUIRED_PARTICIPATION_MEETINGS

  return (
    <li className="rounded-lg border p-2.5 text-sm" style={{ borderColor: "var(--border)" }}>
      <p className="font-medium" style={{ color: "var(--primary)" }}>
        {prospect.name}
      </p>
      <p className="text-xs truncate mb-2" style={{ color: "var(--muted-foreground)" }}>
        {prospect.email}
      </p>
      <ul className="grid grid-cols-1 gap-1.5 text-xs">
        <li>
          <GateIndicator
            complete={gates.finance}
            label="Dues paid"
            pendingLabel="Awaiting dues"
          />
        </li>
        <li>
          {canManage ? (
            <span className="inline-flex items-center gap-1.5 flex-wrap">
              {participationMet ? (
                <Check className="size-3.5 text-emerald-600 shrink-0" />
              ) : (
                <span className="size-3.5 rounded-full border shrink-0" style={{ borderColor: "var(--muted-foreground)", backgroundColor: "var(--muted)" }} />
              )}
              <span style={{ color: participationMet ? "var(--foreground)" : "var(--muted-foreground)" }}>
                Participation: {count}/{REQUIRED_PARTICIPATION_MEETINGS}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-xs"
                onClick={() => onUpdateProspect(prospect.id, { participationCount: count + 1 })}
              >
                +1
              </Button>
            </span>
          ) : (
            <GateIndicator
              complete={participationMet}
              label="Participation met"
              pendingLabel="Needs more meetings"
            />
          )}
        </li>
        <li>
          {canManage ? (
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <Switch
                checked={gates.orientation}
                onCheckedChange={(checked) =>
                  onUpdateProspect(prospect.id, { orientationVerified: checked })
                }
              />
              <span style={{ color: gates.orientation ? "var(--foreground)" : "var(--muted-foreground)" }}>
                {gates.orientation ? "Orientation complete" : "Orientation pending"}
              </span>
            </label>
          ) : (
            <GateIndicator
              complete={gates.orientation}
              label="Orientation complete"
              pendingLabel="Orientation pending"
            />
          )}
        </li>
        <li>
          {canManage ? (
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <Switch
                checked={gates.profile}
                onCheckedChange={(checked) =>
                  onUpdateProspect(prospect.id, { profileComplete: checked })
                }
              />
              <span style={{ color: gates.profile ? "var(--foreground)" : "var(--muted-foreground)" }}>
                {gates.profile ? "Profile complete" : "Profile incomplete"}
              </span>
            </label>
          ) : (
            <GateIndicator
              complete={gates.profile}
              label="Profile complete"
              pendingLabel="Profile incomplete"
            />
          )}
        </li>
      </ul>
      {prospect.stage === "inducted" && prospect.inductionClass && (
        <p className="text-xs mt-2 pt-2 border-t" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
          {prospect.inductionClass}
          {prospect.inductionDate && ` · ${formatDate(prospect.inductionDate)}`}
        </p>
      )}
    </li>
  )
}
