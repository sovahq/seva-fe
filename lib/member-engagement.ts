import type { AttendanceRecord, MemberHealthStatus } from "@/types"

/** Default: inactive after 6 months, at-risk after 3 months without attendance */
const DEFAULT_INACTIVE_MONTHS = 6
const DEFAULT_AT_RISK_MONTHS = 3

/**
 * Returns the most recent attendance date for a member (ISO string or null).
 */
export function getLastAttendanceDate(
  memberId: string,
  records: AttendanceRecord[]
): string | null {
  const forMember = records.filter((r) => r.memberId === memberId)
  if (forMember.length === 0) return null
  const sorted = [...forMember].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  )
  return sorted[0].recordedAt
}

/**
 * Computes member health status from last attendance date.
 * Active: attended within atRiskMonths. At-risk: within inactiveMonths. Inactive: older or never.
 */
export function getMemberHealthStatus(
  lastAttendanceAt: string | null,
  options?: {
    inactiveMonths?: number
    atRiskMonths?: number
    referenceDate?: Date
  }
): MemberHealthStatus {
  const inactiveMonths = options?.inactiveMonths ?? DEFAULT_INACTIVE_MONTHS
  const atRiskMonths = options?.atRiskMonths ?? DEFAULT_AT_RISK_MONTHS
  const ref = options?.referenceDate ?? new Date()

  if (!lastAttendanceAt) return "inactive"

  const last = new Date(lastAttendanceAt)
  const monthsAgo = (ref.getTime() - last.getTime()) / (30.44 * 24 * 60 * 60 * 1000)

  if (monthsAgo <= atRiskMonths) return "active"
  if (monthsAgo <= inactiveMonths) return "at_risk"
  return "inactive"
}
