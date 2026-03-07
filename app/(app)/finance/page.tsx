"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { ChevronDown, ChevronRight, FileText } from "lucide-react"
import {
  mockFinancialSummaries,
  mockExpenseRequisitions,
  mockBudgetCategories,
  mockTransactions,
  mockMemberDues,
} from "@/data/mock"
import { useAuth } from "@/context/AuthContext"
import { canManage } from "@/lib/permissions"
import type {
  ExpenseRequisition,
  ExpenseRequisitionStatus,
  PrimaryCurrency,
  RequisitionAuditEntry,
  BudgetCategory,
  Transaction,
  MemberDuesEntry,
} from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

function formatCurrency(amount: number, currency: PrimaryCurrency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatAuditTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "short" })
}

function statusLabel(s: ExpenseRequisitionStatus): string {
  const map: Record<ExpenseRequisitionStatus, string> = {
    PENDING_FINANCE_REVIEW: "Pending Finance",
    PENDING_PRESIDENT_APPROVAL: "Pending President",
    APPROVED: "Approved",
    DISBURSED: "Disbursed",
    REJECTED: "Rejected",
  }
  return map[s] ?? s
}

function auditActionLabel(action: RequisitionAuditEntry["action"]): string {
  const map: Record<RequisitionAuditEntry["action"], string> = {
    submitted: "Submitted",
    vetted_by_finance: "Vetted by Finance",
    approved_by_president: "Approved by President",
    returned_to_finance: "Returned to Finance",
    flagged_for_clarification: "Flagged for clarification",
    rejected: "Rejected",
    disbursed: "Disbursed",
  }
  return map[action] ?? action
}

type FinanceTab = "dashboard" | "budgets" | "dues" | "requests" | "ledger"

export default function FinancePage() {
  const { currentOrganizationId, currentUser, currentOrganization } = useAuth()
  const orgId = currentOrganizationId ?? ""
  const adminYear = currentOrganization?.fiscalYear ?? new Date().getFullYear()

  const [requisitions, setRequisitions] = useState<ExpenseRequisition[]>(() =>
    mockExpenseRequisitions.filter((r) => r.organizationId === orgId && r.administrativeYear === adminYear)
  )
  const [activeTab, setActiveTab] = useState<FinanceTab>("dashboard")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const financial = mockFinancialSummaries.find((f) => f.organizationId === orgId)
  const budgets = mockBudgetCategories.filter((b) => b.organizationId === orgId && b.administrativeYear === adminYear)
  const transactions = mockTransactions.filter((t) => t.organizationId === orgId && t.administrativeYear === adminYear)
  const dues = mockMemberDues.filter((d) => d.organizationId === orgId && d.administrativeYear === adminYear)

  const pendingFinance = requisitions.filter((r) => r.status === "PENDING_FINANCE_REVIEW")
  const pendingPresident = requisitions.filter((r) => r.status === "PENDING_PRESIDENT_APPROVAL")

  const canManageFinancial = currentUser ? canManage(currentUser.role, "financial") : false
  const isPresident = currentUser?.role === "admin"
  const canVetAsFinance = canManageFinancial && !isPresident

  const actionCount = (canVetAsFinance ? pendingFinance.length : 0) + (isPresident ? pendingPresident.length : 0)

  const totalAllocated = budgets.reduce((s, b) => s + b.allocated, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const totalLiquidity = (financial?.duesCollectedYtd ?? 0) - totalSpent
  const duesTotalOwed = dues.reduce((s, d) => s + d.amountOwed, 0)
  const duesTotalPaid = dues.reduce((s, d) => s + d.amountPaid, 0)
  const duesCollectionPct = duesTotalOwed > 0 ? Math.round((duesTotalPaid / duesTotalOwed) * 100) : 100
  const burnRatePct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0

  function updateRequisition(id: string, updates: Partial<ExpenseRequisition>) {
    setRequisitions((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)))
  }

  function addAudit(
    requisitionId: string,
    action: RequisitionAuditEntry["action"],
    note: string | null
  ) {
    const entry: RequisitionAuditEntry = {
      id: `log-${Date.now()}`,
      requisitionId,
      at: new Date().toISOString(),
      action,
      actorId: currentUser?.id ?? null,
      note,
    }
    setRequisitions((prev) =>
      prev.map((r) => (r.id === requisitionId ? { ...r, auditLog: [...r.auditLog, entry] } : r))
    )
  }

  function handleVet(req: ExpenseRequisition, note: string) {
    addAudit(req.id, "vetted_by_finance", note || null)
    updateRequisition(req.id, { status: "PENDING_PRESIDENT_APPROVAL", financeNote: note || null })
    setExpandedId(null)
  }

  function handleApprove(req: ExpenseRequisition) {
    addAudit(req.id, "approved_by_president", null)
    updateRequisition(req.id, { status: "APPROVED" })
    setExpandedId(null)
  }

  function handleReturn(req: ExpenseRequisition, note: string | null) {
    addAudit(req.id, "returned_to_finance", note)
    updateRequisition(req.id, { status: "PENDING_FINANCE_REVIEW", financeNote: note || null })
    setExpandedId(null)
  }

  function handleFlag(req: ExpenseRequisition, note: string) {
    addAudit(req.id, "flagged_for_clarification", note || null)
    updateRequisition(req.id, { status: "PENDING_FINANCE_REVIEW", financeNote: note || null })
    setExpandedId(null)
  }

  function getCategoryRemaining(categoryId: string | null): number | null {
    if (!categoryId) return null
    const cat = budgets.find((b) => b.id === categoryId)
    return cat ? cat.allocated - cat.spent : null
  }

  const tabs: { id: FinanceTab; label: string; count?: number }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "budgets", label: "Budgets" },
    { id: "dues", label: "Dues" },
    { id: "requests", label: "Requests", count: actionCount > 0 ? actionCount : undefined },
    { id: "ledger", label: "Ledger" },
  ]

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
            Finance & Treasury
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
            {adminYear} administrative year
          </p>
        </div>
      </div>

      <nav
        className="mt-4 flex gap-1 overflow-x-auto rounded-xl bg-muted/40 p-1 pb-2 sm:pb-1"
        aria-label="Finance sections"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id ? "bg-card shadow-sm" : "hover:bg-primary/5"
            )}
            style={{
              color: activeTab === tab.id ? "var(--primary)" : "var(--muted-foreground)",
            }}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-4">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <TreasuryDashboard
                totalLiquidity={totalLiquidity}
                duesCollectionPct={duesCollectionPct}
                burnRatePct={burnRatePct}
                totalAllocated={totalAllocated}
                totalSpent={totalSpent}
                budgets={budgets}
                formatCurrency={formatCurrency}
              />
            </motion.div>
          )}
          {activeTab === "budgets" && (
            <motion.div
              key="budgets"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <BudgetsTab budgets={budgets} formatCurrency={formatCurrency} />
            </motion.div>
          )}
          {activeTab === "dues" && (
            <motion.div
              key="dues"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <DuesTab dues={dues} formatCurrency={formatCurrency} formatDate={formatDate} canManage={canManageFinancial} />
            </motion.div>
          )}
          {activeTab === "requests" && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <RequestsTab
                requisitions={requisitions}
                budgets={budgets}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                canManageFinancial={canManageFinancial}
                canVetAsFinance={canVetAsFinance}
                isPresident={isPresident}
                onVet={handleVet}
                onApprove={handleApprove}
                onReturn={handleReturn}
                onFlag={handleFlag}
                getCategoryRemaining={getCategoryRemaining}
                formatCurrency={formatCurrency}
                formatAuditTime={formatAuditTime}
                statusLabel={statusLabel}
                auditActionLabel={auditActionLabel}
              />
            </motion.div>
          )}
          {activeTab === "ledger" && (
            <motion.div
              key="ledger"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <LedgerTab transactions={transactions} budgets={budgets} formatCurrency={formatCurrency} formatDate={formatDate} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function TreasuryDashboard({
  totalLiquidity,
  duesCollectionPct,
  burnRatePct,
  totalAllocated,
  totalSpent,
  formatCurrency,
  budgets,
}: {
  totalLiquidity: number
  duesCollectionPct: number
  burnRatePct: number
  totalAllocated: number
  totalSpent: number
  formatCurrency: (n: number) => string
  budgets: BudgetCategory[]
}) {
  const budgetChartData = budgets.map((b) => ({
    name: b.name,
    allocated: b.allocated,
    spent: b.spent,
  }))
  return (
    <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
            Total liquidity
          </p>
          <p className="mt-1 text-xl font-semibold" style={{ color: "var(--primary)" }}>
            {formatCurrency(totalLiquidity)}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
            Available after current spend
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
            Dues collection
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, duesCollectionPct)}%`,
                  backgroundColor: "var(--primary)",
                }}
              />
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              {duesCollectionPct}%
            </span>
          </div>
          <p className="mt-0.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
            Collected this year
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
            Budget burn rate
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, burnRatePct)}%`,
                  backgroundColor: burnRatePct > 90 ? "var(--destructive)" : "var(--primary)",
                }}
              />
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              {burnRatePct}%
            </span>
          </div>
          <p className="mt-0.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
            {formatCurrency(totalSpent)} of {formatCurrency(totalAllocated)} used
          </p>
        </CardContent>
      </Card>
    </div>
    {budgetChartData.length > 0 && (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-3" style={{ color: "var(--primary)" }}>
            Budget by category
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number | undefined) => (value != null ? formatCurrency(value) : "")}
                  contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }}
                  labelStyle={{ color: "var(--primary)" }}
                />
                <Legend />
                <Bar dataKey="allocated" name="Allocated" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Spent" fill="var(--primary)" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )}
    </div>
  )
}

function BudgetsTab({
  budgets,
  formatCurrency,
}: {
  budgets: BudgetCategory[]
  formatCurrency: (n: number, c?: PrimaryCurrency) => string
}) {
  if (budgets.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
          No budget categories for this year yet.
        </CardContent>
      </Card>
    )
  }
  const budgetChartData = budgets.map((b) => ({ name: b.name, allocated: b.allocated, spent: b.spent }))
  return (
    <div className="space-y-4">
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-medium mb-3" style={{ color: "var(--primary)" }}>
          Budget by category
        </p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number | undefined) => (value != null ? formatCurrency(value) : "")} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} labelStyle={{ color: "var(--primary)" }} />
              <Legend />
              <Bar dataKey="allocated" name="Allocated" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name="Spent" fill="var(--primary)" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <ul className="space-y-4">
          {budgets.map((b) => {
            const remaining = b.allocated - b.spent
            const pct = b.allocated > 0 ? Math.round((b.spent / b.allocated) * 100) : 0
            return (
              <li key={b.id} className="rounded-lg border border-border/60 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium" style={{ color: "var(--primary)" }}>
                    {b.name}
                  </p>
                  <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    {formatCurrency(remaining, b.currency)} left
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      backgroundColor: pct > 90 ? "var(--destructive)" : "var(--primary)",
                    }}
                  />
                </div>
                <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {formatCurrency(b.spent, b.currency)} spent of {formatCurrency(b.allocated, b.currency)} allocated
                </p>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
    </div>
  )
}

function DuesTab({
  dues,
  formatCurrency,
  formatDate,
  canManage,
}: {
  dues: MemberDuesEntry[]
  formatCurrency: (n: number, currency?: PrimaryCurrency) => string
  formatDate: (iso: string) => string
  canManage: boolean
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  if (dues.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
          No dues records for this year.
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardContent className="p-4">
        <ul className="divide-y divide-border/60">
          {dues.map((d) => {
            const isExpanded = expandedId === d.id
            return (
              <li key={d.id} className="py-3 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--primary)" }}>
                      {d.memberName}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {formatCurrency(d.amountPaid, d.currency)} paid of {formatCurrency(d.amountOwed, d.currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={d.status === "paid" ? "default" : d.status === "partial" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {d.status === "paid" ? "Paid" : d.status === "partial" ? "Partial" : "Owed"}
                    </Badge>
                    {canManage && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1"
                        onClick={() => window.print()}
                        title="Generate receipt"
                      >
                        <FileText className="size-3.5" />
                        Receipt
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : d.id)}
                      className="p-1 rounded hover:bg-primary/10 transition-transform duration-200"
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </button>
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {isExpanded && d.paymentHistory.length > 0 && (
                    <motion.div
                      className="mt-2 border-l border-border/50 pl-3 text-xs overflow-hidden"
                      style={{ color: "var(--muted-foreground)" }}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                    >
                      <p className="font-medium mb-1">Payment history</p>
                      {d.paymentHistory.map((p, i) => (
                        <p key={i}>
                          {formatDate(p.at)}: {formatCurrency(p.amount, d.currency)}
                          {p.note ? ` (${p.note})` : ""}
                        </p>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

function RequestsTab({
  requisitions,
  budgets,
  expandedId,
  setExpandedId,
  canManageFinancial,
  canVetAsFinance,
  isPresident,
  onVet,
  onApprove,
  onReturn,
  onFlag,
  getCategoryRemaining,
  formatCurrency,
  formatAuditTime,
  statusLabel,
  auditActionLabel,
}: {
  requisitions: ExpenseRequisition[]
  budgets: BudgetCategory[]
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  canManageFinancial: boolean
  canVetAsFinance: boolean
  isPresident: boolean
  onVet: (req: ExpenseRequisition, note: string) => void
  onApprove: (req: ExpenseRequisition) => void
  onReturn: (req: ExpenseRequisition, note: string | null) => void
  onFlag: (req: ExpenseRequisition, note: string) => void
  getCategoryRemaining: (id: string | null) => number | null
  formatCurrency: (n: number, currency?: PrimaryCurrency) => string
  formatAuditTime: (iso: string) => string
  statusLabel: (s: ExpenseRequisitionStatus) => string
  auditActionLabel: (a: RequisitionAuditEntry["action"]) => string
}) {
  const pendingList = [
    ...(canVetAsFinance ? requisitions.filter((r) => r.status === "PENDING_FINANCE_REVIEW") : []),
    ...(isPresident ? requisitions.filter((r) => r.status === "PENDING_PRESIDENT_APPROVAL") : []),
  ]
  const allList = requisitions

  if (requisitions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
          No fund requests this year. Joint approval requests will appear here.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {pendingList.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3" style={{ color: "var(--primary)" }}>
              Action needed
            </h3>
            <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
              These requests are waiting on you. Open one to vet or approve.
            </p>
            <ul className="divide-y divide-border/60">
              {pendingList.map((req) => (
                <RequestRow
                  key={req.id}
                  req={req}
                  budgets={budgets}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  getCategoryRemaining={getCategoryRemaining}
                  formatCurrency={(n) => formatCurrency(n, req.currency)}
                  formatAuditTime={formatAuditTime}
                  auditActionLabel={auditActionLabel}
                  mode={
                    req.status === "PENDING_FINANCE_REVIEW" && canVetAsFinance
                      ? "finance"
                      : req.status === "PENDING_PRESIDENT_APPROVAL" && isPresident
                        ? "president"
                        : "readonly"
                  }
                  statusLabel={statusLabel(req.status)}
                  onVet={onVet}
                  onApprove={onApprove}
                  onReturn={onReturn}
                  onFlag={onFlag}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3" style={{ color: "var(--primary)" }}>
            All requests
          </h3>
          <ul className="divide-y divide-border/60">
            {allList.map((req) => (
              <RequestRow
                key={req.id}
                req={req}
                budgets={budgets}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                getCategoryRemaining={getCategoryRemaining}
                formatCurrency={(n) => formatCurrency(n, req.currency)}
                formatAuditTime={formatAuditTime}
                auditActionLabel={auditActionLabel}
                mode={
                  req.status === "PENDING_FINANCE_REVIEW" && canVetAsFinance
                    ? "finance"
                    : req.status === "PENDING_PRESIDENT_APPROVAL" && isPresident
                      ? "president"
                      : "readonly"
                }
                statusLabel={statusLabel(req.status)}
                onVet={onVet}
                onApprove={onApprove}
                onReturn={onReturn}
                onFlag={onFlag}
              />
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function RequestRow({
  req,
  budgets,
  expandedId,
  setExpandedId,
  getCategoryRemaining,
  formatCurrency,
  formatAuditTime,
  auditActionLabel,
  mode,
  statusLabel,
  onVet,
  onApprove,
  onReturn,
  onFlag,
}: {
  req: ExpenseRequisition
  budgets: BudgetCategory[]
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  getCategoryRemaining: (id: string | null) => number | null
  formatCurrency: (n: number, currency?: PrimaryCurrency) => string
  formatAuditTime: (iso: string) => string
  auditActionLabel: (a: RequisitionAuditEntry["action"]) => string
  mode: "finance" | "president" | "readonly"
  statusLabel: string
  onVet?: (req: ExpenseRequisition, note: string) => void
  onApprove?: (req: ExpenseRequisition) => void
  onReturn?: (req: ExpenseRequisition, note: string | null) => void
  onFlag?: (req: ExpenseRequisition, note: string) => void
}) {
  const [note, setNote] = useState(req.financeNote ?? "")
  const [flagNote, setFlagNote] = useState("")
  const isExpanded = expandedId === req.id
  const toggle = () => setExpandedId(isExpanded ? null : req.id)
  const category = req.budgetCategoryId ? budgets.find((b) => b.id === req.budgetCategoryId) : null
  const remaining = getCategoryRemaining(req.budgetCategoryId)

  return (
    <li className="py-2 first:pt-0 last:pb-0">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          className="p-0.5 rounded hover:bg-primary/10 -ml-0.5"
          aria-expanded={isExpanded}
        >
          {isExpanded ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
        </button>
        <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
          <div>
            <p className="font-medium text-sm truncate" style={{ color: "var(--primary)" }}>
              {req.title}
            </p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {formatCurrency(req.amount)}
              {" · "}
              <Badge variant="outline" className="text-[10px] px-1 py-0 font-normal">
                {statusLabel}
              </Badge>
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            Joint
          </Badge>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            className="ml-6 mt-3 space-y-3 border-l border-border/50 pl-3 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          >
            {category && (
            <div className="rounded-lg bg-muted/40 p-2 text-xs">
              <p className="font-medium" style={{ color: "var(--muted-foreground)" }}>
                Budget: {category.name}
              </p>
              <p>
                Request: {formatCurrency(req.amount)}. Remaining in category: {remaining !== null ? formatCurrency(remaining) : "N/A"}
                {remaining !== null && req.amount > remaining && (
                  <span className="text-destructive ml-1">(over budget)</span>
                )}
              </p>
            </div>
          )}
          {req.financeNote && (
            <p className="text-xs">
              <span className="font-medium" style={{ color: "var(--muted-foreground)" }}>Finance note: </span>
              {req.financeNote}
            </p>
          )}
          {mode === "finance" && (
            <>
              <Textarea
                placeholder="Add a note (e.g. Confirmed within budget)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => onVet?.(req, note)}>
                  Vet request
                </Button>
                <span className="text-xs self-center" style={{ color: "var(--muted-foreground)" }}>
                  This request will then be ready for the President&apos;s signature.
                </span>
              </div>
            </>
          )}
          {mode === "president" && (
            <>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                This request is ready for your final authorization.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => onApprove?.(req)}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => onReturn?.(req, null)}>
                  Return to Finance
                </Button>
              </div>
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Flag for clarification
                </p>
                <Textarea
                  placeholder="Ask Finance to clarify something..."
                  value={flagNote}
                  onChange={(e) => setFlagNote(e.target.value)}
                  rows={1}
                  className="text-sm mb-2"
                />
                <Button size="sm" variant="ghost" onClick={() => onFlag?.(req, flagNote)}>
                  Send back with note
                </Button>
              </div>
            </>
          )}
          <div className="pt-4 mt-4 border-t border-border/60">
            <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted-foreground)" }}>
              Audit trail
            </h4>
            <ul className="space-y-0">
              {req.auditLog.map((entry, index) => (
                <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
                  {index < req.auditLog.length - 1 && (
                    <span
                      className="absolute left-[5px] top-4 w-px bottom-0"
                      style={{ backgroundColor: "var(--border)" }}
                      aria-hidden
                    />
                  )}
                  <span
                    className="relative z-10 mt-0.5 size-2.5 shrink-0 rounded-full border-2 border-primary/50"
                    style={{ backgroundColor: "var(--card)" }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-medium" style={{ color: "var(--primary)" }}>
                        {auditActionLabel(entry.action)}
                      </span>
                      <span className="text-xs tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                        {formatAuditTime(entry.at)}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-xs italic leading-snug pt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        &ldquo;{entry.note}&rdquo;
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

function LedgerTab({
  transactions,
  budgets,
  formatCurrency,
  formatDate,
}: {
  transactions: Transaction[]
  budgets: BudgetCategory[]
  formatCurrency: (n: number, c?: PrimaryCurrency) => string
  formatDate: (iso: string) => string
}) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
          No transactions this year yet.
        </CardContent>
      </Card>
    )
  }
  const getCategoryName = (id: string | null) => (id ? budgets.find((b) => b.id === id)?.name ?? "Other" : "General")
  const monthKeys = new Map<string, { income: number; expense: number }>()
  transactions.forEach((tx) => {
    const month = tx.date.slice(0, 7)
    const entry = monthKeys.get(month) ?? { income: 0, expense: 0 }
    if (tx.type === "income") entry.income += tx.amount
    else entry.expense += tx.amount
    monthKeys.set(month, entry)
  })
  const ledgerChartData = Array.from(monthKeys.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, ...v, name: new Date(month + "-01").toLocaleDateString(undefined, { month: "short", year: "numeric" }) }))
  return (
    <div className="space-y-4">
    {ledgerChartData.length > 0 && (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-3" style={{ color: "var(--primary)" }}>
            Income vs expense over time
          </p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ledgerChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number | undefined) => (value != null ? formatCurrency(value) : "")} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} labelStyle={{ color: "var(--primary)" }} />
                <Legend />
                <Line type="monotone" dataKey="income" name="Income" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="expense" name="Expense" stroke="var(--destructive)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )}
    <Card>
      <CardContent className="p-4">
        <ul className="divide-y divide-border/60">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
              <div>
                <p className="font-medium text-sm" style={{ color: "var(--primary)" }}>
                  {tx.description}
                </p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {formatDate(tx.date)} · {getCategoryName(tx.categoryId)}
                </p>
              </div>
              <span
                className={cn(
                  "font-medium text-sm",
                  tx.type === "income" ? "text-green-600 dark:text-green-400" : "text-foreground"
                )}
              >
                {tx.type === "income" ? "+" : "-"}
                {formatCurrency(tx.amount, tx.currency)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
    </div>
  )
}
