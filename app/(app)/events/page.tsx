"use client"

import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useEvents } from "@/context/EventsContext"
import { canManage } from "@/lib/permissions"
import { ROUTES } from "@/routes/routenames"
import { CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EventsPage() {
  const { currentOrganizationId, currentUser, organizations } = useAuth()
  const { events } = useEvents()
  const effectiveOrgId = currentOrganizationId ?? organizations[0]?.id ?? null
  const orgEvents = events.filter((e) =>
    effectiveOrgId !== null ? e.organizationId === effectiveOrgId : !e.organizationId || e.organizationId === ""
  )
  const canManageEvents = currentUser ? canManage(currentUser.role, "projects") : false

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
            Events
          </h1>
          <p className="mt-1" style={{ color: "var(--muted-foreground)" }}>
            Upcoming and past events.
          </p>
        </div>
        {canManageEvents && (
          <Button asChild className="gap-2">
            <Link href={ROUTES.EVENTS_NEW}>
              <CalendarPlus className="size-4" />
              Create meeting
            </Link>
          </Button>
        )}
      </div>
      <ul className="mt-6 list-none space-y-2">
        {orgEvents.length === 0 ? (
          <li style={{ color: "var(--muted-foreground)" }}>No upcoming events.</li>
        ) : (
          orgEvents.map((evt) => (
            <li key={evt.id}>
              <Link
                href={`${ROUTES.EVENTS}/${evt.id}`}
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                {evt.name}
              </Link>
              <span className="ml-2" style={{ color: "var(--muted-foreground)" }}>
                {evt.date}
                {evt.startTime ? ` · ${new Date(evt.startTime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}` : ""}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
