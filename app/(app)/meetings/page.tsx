"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useAuth } from "@/context/AuthContext"
import { useMeetings } from "@/context/MeetingsContext"
import { canManage } from "@/lib/permissions"
import { ROUTES } from "@/routes/routenames"
import { CalendarPlus, Calendar, MapPin, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Meeting } from "@/types"

const today = () => {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function formatMeetingDate(dateStr: string, startTime?: string) {
  const date = new Date(dateStr)
  const dateFormatted = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  if (startTime) {
    const time = new Date(startTime).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
    return `${dateFormatted} · ${time}`
  }
  return dateFormatted
}

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const isVirtual = meeting.locationType === "virtual"
  const LocationIcon = isVirtual ? Video : MapPin

  return (
    <Link
      href={`${ROUTES.MEETINGS}/${meeting.id}`}
      className="flex h-full transition-opacity hover:opacity-90"
    >
      <Card
        size="sm"
        className="flex h-full w-full flex-col border transition-shadow hover:shadow-md"
        style={{ borderColor: "var(--border)" }}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 font-semibold" style={{ color: "var(--primary)" }}>
            {meeting.name}
          </CardTitle>
          <Badge variant="outline" className="shrink-0 gap-1 text-xs">
            <LocationIcon className="size-3" />
            {isVirtual ? "Virtual" : "In person"}
          </Badge>
        </CardHeader>
        <CardContent className="mt-auto pt-0" style={{ color: "var(--muted-foreground)" }}>
          <p className="flex items-center gap-1.5 text-sm">
            <Calendar className="size-4 shrink-0 opacity-70" />
            {formatMeetingDate(meeting.date, meeting.startTime)}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function MeetingsPage() {
  const { currentOrganizationId, currentUser, organizations } = useAuth()
  const { meetings } = useMeetings()
  const effectiveOrgId = currentOrganizationId ?? organizations[0]?.id ?? null
  const orgMeetings = useMemo(
    () =>
      meetings.filter((m) =>
        effectiveOrgId !== null ? m.organizationId === effectiveOrgId : !m.organizationId || m.organizationId === ""
      ),
    [meetings, effectiveOrgId]
  )

  const { upcoming, past } = useMemo(() => {
    const t = today()
    const up: Meeting[] = []
    const pa: Meeting[] = []
    for (const m of orgMeetings) {
      if (m.date >= t) up.push(m)
      else pa.push(m)
    }
    up.sort((a, b) => a.date.localeCompare(b.date))
    pa.sort((a, b) => b.date.localeCompare(a.date))
    return { upcoming: up, past: pa }
  }, [orgMeetings])

  const canManageMeetings = currentUser ? canManage(currentUser.role, "projects") : false

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
            Meetings
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Upcoming and past meetings for your organisation.
          </p>
        </div>
        {canManageMeetings && (
          <Button asChild className="gap-2">
            <Link href={ROUTES.MEETINGS_NEW}>
              <CalendarPlus className="size-4" />
              Create meeting
            </Link>
          </Button>
        )}
      </div>

      {orgMeetings.length === 0 ? (
        <Card className="mt-8 border-dashed" style={{ borderColor: "var(--border)" }}>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div
              className="mb-4 flex size-14 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--muted)" }}
            >
              <Calendar className="size-7" style={{ color: "var(--muted-foreground)" }} />
            </div>
            <p className="font-medium" style={{ color: "var(--primary)" }}>
              No meetings yet
            </p>
            <p className="mt-1 max-w-sm text-sm" style={{ color: "var(--muted-foreground)" }}>
              Create your first meeting to get started.
            </p>
            {canManageMeetings && (
              <Button asChild className="mt-6 gap-2">
                <Link href={ROUTES.MEETINGS_NEW}>
                  <CalendarPlus className="size-4" />
                  Create meeting
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-10">
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Upcoming
              </h2>
              <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((meeting) => (
                  <li key={meeting.id}>
                    <MeetingCard meeting={meeting} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Past
              </h2>
              <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((meeting) => (
                  <li key={meeting.id}>
                    <MeetingCard meeting={meeting} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
