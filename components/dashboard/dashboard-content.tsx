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
import {
  mockGovernanceDocuments,
  mockFinancialSummaries,
  mockMembers,
} from "@/data/mock"
import { useAuth } from "@/context/AuthContext"
import { useDues } from "@/context/DuesContext"
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

  const documents = mockGovernanceDocuments
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome / Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "var(--primary)" }}>
          Dashboard
        </h1>
        <p className="mt-1.5 text-base" style={{ color: "var(--muted-foreground)" }}>
          {currentOrganization?.name && (
            <span className="font-medium" style={{ color: "var(--primary)" }}>{currentOrganization.name}</span>
          )}
          {currentOrganization?.name && " · "}
          {adminYear} overview. Governance, members, meetings, and finances at a glance.
        </p>
      </header>

      {/* Quick Actions – only when user has a member record */}
      {member && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--muted-foreground)" }}>
            Quick Actions
          </h2>
          <Link
            href={ROUTES.DUES}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
          >
            <Card
              className={cn(
                "overflow-hidden rounded-2xl border-2 shadow-sm transition-all hover:shadow-md",
                duesPaid ? "border-primary/20 bg-primary/[0.03]" : "border-primary/40 bg-primary/[0.04]"
              )}
            >
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      <Wallet className="size-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>
                        {duesPaid ? `Dues paid for ${adminYear}` : "Pay Dues"}
                      </h3>
                      <p className="mt-1 text-sm max-w-md" style={{ color: "var(--muted-foreground)" }}>
                        {duesPaid
                          ? "Your payment has been confirmed by Finance. View your dues history anytime."
                          : "Pay your dues for the year and upload your payment receipt. Finance will confirm once received."}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {duesPaid ? (
                      <Badge variant="default" className="text-sm px-4 py-2 rounded-lg">
                        View dues
                      </Badge>
                    ) : (
                      <span
                        className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                        style={{ backgroundColor: "var(--primary)" }}
                      >
                        Pay Dues now
                        <ChevronRight className="size-4" />
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
      <section className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--muted-foreground)" }}>
          At a glance
        </h2>
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {statCards.map(({ label, value, icon: Icon, href }) => (
            <Link key={label} href={href}>
              <Card className="rounded-2xl border border-border/80 bg-card shadow-sm transition-colors hover:bg-muted/30 h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                        {label}
                      </p>
                      <p className="mt-1.5 text-2xl font-bold tabular-nums" style={{ color: "var(--primary)" }}>
                        {value}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="size-5" style={{ color: "var(--primary)" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <Card className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <p className="text-sm font-medium" style={{ color: "var(--primary)" }}>
              Key metrics
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-48 w-full sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value: unknown, _name: unknown, props: { payload?: { fullLabel?: string } }) =>
                      [props?.payload?.fullLabel ?? String(value), ""]
                    }
                    contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    labelStyle={{ color: "var(--primary)" }}
                  />
                  <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Explore – pillar links */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--muted-foreground)" }}>
          Explore
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {pillarLinks.map(({ title, description, icon: Icon, href, content }) => (
            <Link key={title} href={href}>
              <Card className="group h-full rounded-2xl border border-border/80 bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <Icon className="size-5" style={{ color: "var(--primary)" }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold" style={{ color: "var(--primary)" }}>
                        {title}
                      </h3>
                      <p className="mt-0.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
                        {description}
                      </p>
                      <p className="mt-3 line-clamp-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                        {content}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium" style={{ color: "var(--primary)" }}>
                        View
                        <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
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
