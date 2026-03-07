import type { Meeting } from "@/types"

export const mockMeetings: Meeting[] = [
  {
    id: "mtg-1",
    organizationId: "org-jci-eko",
    name: "Annual General Meeting",
    date: "2026-03-15",
    startTime: "2026-03-15T10:00:00",
    locationType: "physical",
    address: "JCI Eko Secretariat, 12 Marina Way, Lagos",
    checkInCode: "AGM202",
    checkInCodeExpiresAt: "2026-03-15T18:00:00",
  },
  {
    id: "mtg-2",
    organizationId: "org-jci-eko",
    name: "Leadership Retreat",
    date: "2026-04-20",
    startTime: "2026-04-20T09:00:00",
    locationType: "virtual",
    meetingLink: "https://meet.example.com/retreat",
  },
  {
    id: "mtg-3",
    organizationId: "org-jci-eko",
    name: "February Chapter Meeting",
    date: "2026-02-10",
    startTime: "2026-02-10T14:00:00",
    locationType: "virtual",
    meetingLink: "https://zoom.us/j/123456789",
    checkInCode: "FEB10",
    checkInCodeExpiresAt: "2026-02-10T23:59:59",
  },
  {
    id: "mtg-4",
    organizationId: "org-jci-eko",
    name: "January Orientation",
    date: "2026-01-20",
  },
  {
    id: "mtg-5",
    organizationId: "org-demo",
    name: "Q2 Planning",
    date: "2026-05-01",
  },
]
