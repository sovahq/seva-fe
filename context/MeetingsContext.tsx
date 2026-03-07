"use client"

import * as React from "react"
import { mockMeetings } from "@/data/mock/meetings"
import { mockAttendanceRecords } from "@/data/mock/attendance"
import type { Meeting, AttendanceRecord } from "@/types"

/** In-memory store so state survives MeetingsProvider remounts (e.g. Strict Mode or navigation). */
let meetingsStore: Meeting[] = [...mockMeetings]
let attendanceStore: AttendanceRecord[] = [...mockAttendanceRecords]

type MeetingsContextValue = {
  meetings: Meeting[]
  attendance: AttendanceRecord[]
  addMeeting: (meeting: Meeting) => void
  updateMeeting: (id: string, updates: Partial<Meeting>) => void
  addAttendanceRecord: (record: AttendanceRecord) => void
  getAttendanceForMeeting: (meetingId: string) => AttendanceRecord[]
}

const MeetingsContext = React.createContext<MeetingsContextValue | null>(null)

export function MeetingsProvider({ children }: { children: React.ReactNode }) {
  const [meetings, setMeetings] = React.useState<Meeting[]>(() => [...meetingsStore])
  const [attendance, setAttendance] = React.useState<AttendanceRecord[]>(() => [...attendanceStore])

  const addMeeting = React.useCallback((meeting: Meeting) => {
    setMeetings((prev) => {
      const next = [...prev, meeting]
      meetingsStore = next
      return next
    })
  }, [])

  const updateMeeting = React.useCallback((id: string, updates: Partial<Meeting>) => {
    setMeetings((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      meetingsStore = next
      return next
    })
  }, [])

  const addAttendanceRecord = React.useCallback((record: AttendanceRecord) => {
    setAttendance((prev) => {
      const next = [...prev, record]
      attendanceStore = next
      return next
    })
  }, [])

  const getAttendanceForMeeting = React.useCallback(
    (meetingId: string) => attendance.filter((a) => a.meetingId === meetingId),
    [attendance]
  )

  const value: MeetingsContextValue = React.useMemo(
    () => ({
      meetings,
      attendance,
      addMeeting,
      updateMeeting,
      addAttendanceRecord,
      getAttendanceForMeeting,
    }),
    [meetings, attendance, addMeeting, updateMeeting, addAttendanceRecord, getAttendanceForMeeting]
  )

  return <MeetingsContext.Provider value={value}>{children}</MeetingsContext.Provider>
}

export function useMeetings(): MeetingsContextValue {
  const ctx = React.useContext(MeetingsContext)
  if (!ctx) throw new Error("useMeetings must be used within MeetingsProvider")
  return ctx
}
