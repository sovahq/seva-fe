"use client"

import Link from "next/link"
import { mockEvents } from "@/data/mock"
import { useAuth } from "@/context/AuthContext"
import { ROUTES } from "@/routes/routenames"

export default function EventsPage() {
  const { currentOrganizationId } = useAuth()
  const events = mockEvents.filter((e) => e.organizationId === currentOrganizationId)

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
        Events
      </h1>
      <p className="mt-1" style={{ color: "var(--muted-foreground)" }}>
        Upcoming and past events.
      </p>
      <ul className="mt-6 list-none space-y-2">
        {events.length === 0 ? (
          <li style={{ color: "var(--muted-foreground)" }}>No upcoming events.</li>
        ) : (
          events.map((evt) => (
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
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
