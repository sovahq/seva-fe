import type { Event } from "@/types"

export const mockEvents: Event[] = [
  { id: "evt-1", organizationId: "org-jci-eko", name: "Annual General Meeting", date: "2026-03-15", type: "meeting" },
  { id: "evt-2", organizationId: "org-jci-eko", name: "Leadership Retreat", date: "2026-04-20", type: "event" },
  { id: "evt-3", organizationId: "org-jci-eko", name: "February Chapter Meeting", date: "2026-02-10", type: "meeting" },
  { id: "evt-4", organizationId: "org-jci-eko", name: "January Orientation", date: "2026-01-20", type: "event" },
  { id: "evt-5", organizationId: "org-demo", name: "Q2 Planning", date: "2026-05-01", type: "meeting" },
]
