import type { AttendanceRecord } from "@/types"

export const mockAttendanceRecords: AttendanceRecord[] = [
  { id: "att-1", organizationId: "org-jci-eko", meetingId: "mtg-3", memberId: "m-1", recordedAt: "2026-02-10T10:00:00Z" },
  { id: "att-2", organizationId: "org-jci-eko", meetingId: "mtg-3", memberId: "m-2", recordedAt: "2026-02-10T10:01:00Z" },
  { id: "att-3", organizationId: "org-jci-eko", meetingId: "mtg-3", memberId: "m-3", recordedAt: "2026-02-10T10:02:00Z" },
  { id: "att-4", organizationId: "org-jci-eko", meetingId: "mtg-4", memberId: "m-1", recordedAt: "2026-01-20T09:00:00Z" },
  { id: "att-5", organizationId: "org-jci-eko", meetingId: "mtg-4", memberId: "m-2", recordedAt: "2026-01-20T09:00:00Z" },
  { id: "att-6", organizationId: "org-jci-eko", meetingId: "mtg-4", memberId: "m-3", recordedAt: "2026-01-20T09:00:00Z" },
  { id: "att-7", organizationId: "org-jci-eko", meetingId: "mtg-4", memberId: "m-4", recordedAt: "2026-01-20T09:00:00Z" },
]
