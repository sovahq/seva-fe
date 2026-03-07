"use client"

import * as React from "react"
import { mockEvents } from "@/data/mock/events"
import { mockAttendanceRecords } from "@/data/mock/attendance"
import type { Event, AttendanceRecord } from "@/types"

const STORAGE_KEY_EVENTS = "seva-events"
const STORAGE_KEY_ATTENDANCE = "seva-attendance"

function loadEvents(): Event[] {
  if (typeof window === "undefined") return mockEvents
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS)
    if (!raw) return mockEvents
    const parsed = JSON.parse(raw) as Event[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : mockEvents
  } catch {
    return mockEvents
  }
}

function loadAttendance(): AttendanceRecord[] {
  if (typeof window === "undefined") return mockAttendanceRecords
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ATTENDANCE)
    if (!raw) return mockAttendanceRecords
    const parsed = JSON.parse(raw) as AttendanceRecord[]
    return Array.isArray(parsed) ? parsed : mockAttendanceRecords
  } catch {
    return mockAttendanceRecords
  }
}

type EventsContextValue = {
  events: Event[]
  attendance: AttendanceRecord[]
  addEvent: (event: Event) => void
  updateEvent: (id: string, updates: Partial<Event>) => void
  addAttendanceRecord: (record: AttendanceRecord) => void
  getAttendanceForEvent: (eventId: string) => AttendanceRecord[]
}

const EventsContext = React.createContext<EventsContextValue | null>(null)

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = React.useState<Event[]>(mockEvents)
  const [attendance, setAttendance] = React.useState<AttendanceRecord[]>(mockAttendanceRecords)
  const hasLoadedRef = React.useRef(false)

  React.useEffect(() => {
    setEvents(loadEvents())
    setAttendance(loadAttendance())
    hasLoadedRef.current = true
  }, [])

  React.useEffect(() => {
    if (!hasLoadedRef.current || typeof window === "undefined") return
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events))
      localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(attendance))
    } catch {
      // ignore quota or parse errors
    }
  }, [events, attendance])

  const addEvent = React.useCallback((event: Event) => {
    setEvents((prev) => [...prev, event])
  }, [])

  const updateEvent = React.useCallback((id: string, updates: Partial<Event>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
  }, [])

  const addAttendanceRecord = React.useCallback((record: AttendanceRecord) => {
    setAttendance((prev) => [...prev, record])
  }, [])

  const getAttendanceForEvent = React.useCallback(
    (eventId: string) => attendance.filter((a) => a.eventId === eventId),
    [attendance]
  )

  const value: EventsContextValue = React.useMemo(
    () => ({
      events,
      attendance,
      addEvent,
      updateEvent,
      addAttendanceRecord,
      getAttendanceForEvent,
    }),
    [events, attendance, addEvent, updateEvent, addAttendanceRecord, getAttendanceForEvent]
  )

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

export function useEvents(): EventsContextValue {
  const ctx = React.useContext(EventsContext)
  if (!ctx) throw new Error("useEvents must be used within EventsProvider")
  return ctx
}
