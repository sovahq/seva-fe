"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useMeetings } from "@/context/MeetingsContext"
import { canManage } from "@/lib/permissions"
import { generateCheckInCode } from "@/lib/check-in-code"
import { mockMembers } from "@/data/mock/members"
import { ROUTES } from "@/routes/routenames"
import { ArrowLeft, ExternalLink, LogIn, Pencil, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MeetingDetailPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""
  const { currentUser, currentOrganizationId } = useAuth()
  const { meetings, getAttendanceForMeeting, addAttendanceRecord, updateMeeting } = useMeetings()

  const meeting = useMemo(() => meetings.find((m) => m.id === id), [meetings, id])
  const attendance = useMemo(
    () => (meeting ? getAttendanceForMeeting(meeting.id) : []),
    [meeting, getAttendanceForMeeting]
  )
  const canManageMeetings = currentUser ? canManage(currentUser.role, "projects") : false

  const [checkInCodeInput, setCheckInCodeInput] = useState("")
  const [checkInStatus, setCheckInStatus] = useState<"idle" | "success" | "error">("idle")
  const [checkInMessage, setCheckInMessage] = useState("")

  if (!meeting) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <p style={{ color: "var(--muted-foreground)" }}>Meeting not found.</p>
        <Button variant="link" asChild className="mt-2 gap-1.5 p-0">
          <Link href={ROUTES.MEETINGS}>
            <ArrowLeft className="size-4 shrink-0" />
            Back to meetings
          </Link>
        </Button>
      </div>
    )
  }

  const startTimeFormatted = meeting.startTime
    ? new Date(meeting.startTime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : null
  const expiresAtFormatted =
    meeting.checkInCodeExpiresAt &&
    new Date(meeting.checkInCodeExpiresAt).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    })
  const isCodeExpired =
    meeting.checkInCodeExpiresAt && new Date() > new Date(meeting.checkInCodeExpiresAt)

  function handleRegenerateCode() {
    if (!meeting) return
    const newCode = generateCheckInCode()
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setHours(23, 59, 59, 0)
    updateMeeting(meeting.id, {
      checkInCode: newCode,
      checkInCodeExpiresAt: expiresAt.toISOString().slice(0, 19),
    })
  }

  function handleCheckIn(e: React.FormEvent) {
    e.preventDefault()
    if (!meeting) return
    setCheckInStatus("idle")
    setCheckInMessage("")

    const code = checkInCodeInput.trim()
    if (!code) {
      setCheckInStatus("error")
      setCheckInMessage("Enter the check-in code.")
      return
    }
    if (code !== meeting.checkInCode) {
      setCheckInStatus("error")
      setCheckInMessage("Invalid code.")
      return
    }
    if (meeting.checkInCodeExpiresAt && new Date() > new Date(meeting.checkInCodeExpiresAt)) {
      setCheckInStatus("error")
      setCheckInMessage("This check-in code has expired.")
      return
    }

    const orgId = currentOrganizationId ?? ""
    const member = mockMembers.find(
      (m) =>
        m.organizationId === orgId &&
        m.email?.toLowerCase() === currentUser?.email?.toLowerCase()
    )
    if (!member) {
      setCheckInStatus("error")
      setCheckInMessage("You're not registered as a member for this organisation.")
      return
    }

    const alreadyCheckedIn = attendance.some((a) => a.memberId === member.id)
    if (alreadyCheckedIn) {
      setCheckInStatus("success")
      setCheckInMessage("Already checked in.")
      return
    }

    addAttendanceRecord({
      id: `att-${Date.now()}`,
      organizationId: orgId,
      meetingId: meeting.id,
      memberId: member.id,
      recordedAt: new Date().toISOString(),
    })
    setCheckInStatus("success")
    setCheckInMessage("You're checked in.")
    setCheckInCodeInput("")
  }

  const attendeeNames = useMemo(() => {
    return attendance.map((a) => {
      const m = mockMembers.find((x) => x.id === a.memberId)
      return m?.name ?? a.memberId
    })
  }, [attendance])

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-4">
        <Link
          href={ROUTES.MEETINGS}
          className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          style={{ color: "var(--muted-foreground)" }}
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to meetings
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
            {meeting.name}
          </h1>
          <p className="mt-1" style={{ color: "var(--muted-foreground)" }}>
            {meeting.date}
            {startTimeFormatted && ` · ${startTimeFormatted}`}
          </p>
        </div>
        {canManageMeetings && (
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <Link href={`${ROUTES.MEETINGS}/${meeting.id}/edit`}>
              <Pencil className="size-3.5" />
              Edit
            </Link>
          </Button>
        )}
      </div>

      {meeting.locationType === "virtual" && meeting.meetingLink && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle style={{ color: "var(--primary)" }}>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={meeting.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium underline underline-offset-2"
              style={{ color: "var(--primary)" }}
            >
              Join meeting
              <ExternalLink className="size-3.5 shrink-0" />
            </a>
          </CardContent>
        </Card>
      )}

      {meeting.locationType === "physical" && meeting.address && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle style={{ color: "var(--primary)" }}>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ color: "var(--foreground)" }}>{meeting.address}</p>
          </CardContent>
        </Card>
      )}

      {meeting.flierUrl && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle style={{ color: "var(--primary)" }}>Flier</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={meeting.flierUrl}
              alt="Meeting flier"
              className="max-h-80 w-full rounded-lg border border-border/60 object-contain"
            />
          </CardContent>
        </Card>
      )}

      {canManageMeetings && (meeting.checkInCode || meeting.checkInCodeExpiresAt) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle style={{ color: "var(--primary)" }}>Check-in code</CardTitle>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Share this code at the meeting. It stops working after the expiration time.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-lg border bg-muted/30 px-4 py-2 font-mono text-lg font-semibold tracking-wider"
                style={{ color: "var(--primary)", borderColor: "var(--border)" }}
              >
                {meeting.checkInCode ?? "—"}
              </span>
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleRegenerateCode}>
                <RefreshCw className="size-3.5" />
                Regenerate
              </Button>
            </div>
            {expiresAtFormatted && (
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Code expires at {expiresAtFormatted}
                {isCodeExpired && " (expired)"}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle style={{ color: "var(--primary)" }}>Check in</CardTitle>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Enter the code shared at the meeting to record your attendance.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckIn} className="flex flex-wrap items-end gap-2">
            <div className="min-w-[140px] flex-1">
              <label htmlFor="check-in-code" className="sr-only">
                Check-in code
              </label>
              <Input
                id="check-in-code"
                value={checkInCodeInput}
                onChange={(e) => setCheckInCodeInput(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="font-mono uppercase"
                maxLength={10}
              />
            </div>
            <Button type="submit" className="gap-2">
              <LogIn className="size-4" />
              Check in
            </Button>
          </form>
          {checkInStatus === "success" && (
            <p className="mt-2 text-sm font-medium" style={{ color: "var(--primary)" }}>
              {checkInMessage}
            </p>
          )}
          {checkInStatus === "error" && (
            <p className="mt-2 text-sm text-destructive">{checkInMessage}</p>
          )}
        </CardContent>
      </Card>

      {canManageMeetings && attendeeNames.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle style={{ color: "var(--primary)" }}>Attendees</CardTitle>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {attendeeNames.length} checked in
            </p>
          </CardHeader>
          <CardContent>
            <ul className="list-none space-y-1">
              {attendeeNames.map((name, i) => (
                <li key={i} style={{ color: "var(--foreground)" }}>
                  {name}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
