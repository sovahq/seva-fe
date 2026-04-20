"use client"

import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { mockFinancialSummaries, mockMembers } from "@/data/mock"
import { useAuth } from "@/context/AuthContext"
import { useDues } from "@/context/DuesContext"
import { useGovernance } from "@/context/GovernanceContext"
import { useMeetings } from "@/context/MeetingsContext"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ROUTES } from "@/routes/routenames"
import {
  Wallet,
  FileText,
  Users,
  Calendar,
  ChevronRight,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function DashboardContent() {
  const { currentOrganizationId, currentUser, currentOrganization } = useAuth()
  const { memberDues } = useDues()
  const { documents: governanceDocuments } = useGovernance()
  const { meetings: allMeetings } = useMeetings()

  const orgId = currentOrganizationId ?? currentUser?.organizationId ?? ""
  const adminYear = currentOrganization?.fiscalYear ?? new Date().getFullYear()
  const member = currentUser
    ? mockMembers.find(
        (m) =>
          m.organizationId === orgId &&
          m.email?.toLowerCase() === currentUser.email?.toLowerCase()
      )
    : null

  const myDuesEntry = member
    ? memberDues.find(
        (d) =>
          d.organizationId === orgId &&
          d.administrativeYear === adminYear &&
          d.memberId === member.id
      )
    : null
  const duesPaid = myDuesEntry?.status === "paid"

  const documents = governanceDocuments
    .filter((d) => d.organizationId === currentOrganizationId)
    .slice(0, 3)

  const financial = mockFinancialSummaries.find(
    (f) => f.organizationId === currentOrganizationId
  )

  const members = mockMembers
    .filter((m) => m.organizationId === currentOrganizationId)
    .slice(0, 3)
  const memberCount = mockMembers.filter(
    (m) => m.organizationId === currentOrganizationId
  ).length

  const meetings = allMeetings
    .filter((m) => m.organizationId === currentOrganizationId)
    .slice(0, 3)
  const meetingCount = allMeetings.filter(
    (m) => m.organizationId === currentOrganizationId
  ).length
  const overviewChartData = [
    { name: "Members", value: memberCount, fullLabel: `${memberCount} members` },
    { name: "Meetings", value: meetingCount, fullLabel: `${meetingCount} meetings` },
    {
      name: "Dues YTD (₦k)",
      value: financial ? Math.round(financial.duesCollectedYtd / 1000) : 0,
      fullLabel: financial ? formatCurrency(financial.duesCollectedYtd) : "—",
    },
  ]

  const statCards = [
    {
      label: "Members",
      value: memberCount,
      icon: Users,
      href: ROUTES.MEMBERS,
    },
    {
      label: "Meetings",
      value: meetingCount,
      icon: Calendar,
      href: ROUTES.MEETINGS,
    },
    {
      label: "Dues collected YTD",
      value: financial ? formatCurrency(financial.duesCollectedYtd) : "—",
      icon: TrendingUp,
      href: ROUTES.FINANCE,
    },
  ]

  const pillarLinks = [
    {
      title: "Executive Governance",
      description: "Policies, bylaws, and governance documents",
      icon: FileText,
      href: ROUTES.GOVERNANCE,
      content: documents.length === 0 ? "No documents yet" : documents.map((d) => d.title).join(", "),
    },
    {
      title: "Financial Integrity",
      description: "Treasury, dues, and financial reports",
      icon: Wallet,
      href: ROUTES.FINANCE,
      content: financial
        ? `Dues YTD: ${formatCurrency(financial.duesCollectedYtd)} · ${financial.pendingRetirementsCount} pending retirements`
        : "No financial summary",
    },
    {
      title: "Membership Lifecycle",
      description: "Member directory and engagement",
      icon: Users,
      href: ROUTES.MEMBERS,
      content: memberCount === 0 ? "No members" : `${memberCount} members · ${members.map((m) => m.name).join(", ")}`,
    },
    {
      title: "Project Operations",
      description: "Meetings and project tracking",
      icon: Calendar,
      href: ROUTES.MEETINGS,
      content: meetings.length === 0 ? "No upcoming meetings" : meetings.map((m) => `${m.name} (${m.date})`).join(" · "),
    },
  ]

  return (
    <div className="grid grid-cols-12 gap-x-8 gap-y-16">
      {/* Welcome / Header */}
      <header className="col-span-12">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {currentOrganization?.name && (
            <span className="font-semibold text-primary">{currentOrganization.name}</span>
          )}
          {currentOrganization?.name && " · "}
          {adminYear} overview. Governance, members, meetings, and finances at a glance.
        </p>
      </header>

      {/* Quick Actions – only when user has a member record */}
      {member && (
        <section className="col-span-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-icon-muted">
            Quick actions
          </h2>
          <Link
            href={ROUTES.DUES}
            className="block rounded-[1.25rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
          >
            <Card
              className={cn(
                "overflow-hidden rounded-[1.25rem] border transition-colors hover:border-brand-link/40",
                duesPaid ? "border-border bg-surface-soft/40" : "border-primary/35 bg-surface-soft/60"
              )}
            >
              <CardContent className="p-8 sm:p-10">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary">
                      <Wallet className="size-7 stroke-[1.5] text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-primary">
                        {duesPaid ? `Dues paid for ${adminYear}` : "Pay dues"}
                      </h3>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                        {duesPaid
                          ? "Your payment has been confirmed by Finance. View your dues history anytime."
                          : "Pay your dues for the year and upload your payment receipt. Finance will confirm once received."}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {duesPaid ? (
                      <Badge variant="default" className="rounded-full px-4 py-2 text-sm">
                        View dues
                      </Badge>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]">
                        Pay dues now
                        <ChevronRight className="size-4 stroke-[1.5]" />
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>
      )}

      {/* Key metrics – stat cards + chart */}
      <section className="col-span-12 space-y-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-icon-muted">
          At a glance
        </h2>
        <div className="grid gap-6 sm:grid-cols-12">
          {statCards.map(({ label, value, icon: Icon, href }) => (
            <Link key={label} href={href} className="sm:col-span-4">
              <Card className="h-full rounded-[1.25rem] border border-border bg-card transition-colors hover:border-brand-link/50 hover:bg-surface-soft/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-2 text-2xl font-bold tabular-nums text-primary">
                        {value}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-soft">
                      <Icon className="size-5 stroke-[1.5] text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <Card className="overflow-hidden rounded-[1.25rem] border border-border bg-card">
          <CardHeader className="pb-2">
            <p className="text-sm font-semibold text-primary">Key metrics</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-48 w-full sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/70" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value: unknown, _name: unknown, props: { payload?: { fullLabel?: string } }) =>
                      [props?.payload?.fullLabel ?? String(value), ""]
                    }
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      boxShadow: "none",
                      background: "var(--card)",
                    }}
                    labelStyle={{ color: "var(--primary)" }}
                  />
                  <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Explore – pillar links */}
      <section className="col-span-12 space-y-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-icon-muted">
          Explore
        </h2>
        <div className="grid gap-6 sm:grid-cols-12">
          {pillarLinks.map(({ title, description, icon: Icon, href, content }) => (
            <Link key={title} href={href} className="sm:col-span-6">
              <Card className="group h-full rounded-[1.25rem] border border-border bg-card transition-colors hover:border-brand-link/45 hover:bg-surface-soft/25">
                <CardContent className="p-8">
                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-soft transition-colors group-hover:bg-surface-soft/80">
                      <Icon className="size-5 stroke-[1.5] text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-primary">{title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                      <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{content}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-link transition-colors group-hover:text-primary">
                        View
                        <ChevronRight className="size-4 stroke-[1.5] transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
