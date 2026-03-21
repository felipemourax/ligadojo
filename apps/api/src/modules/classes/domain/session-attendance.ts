export type SessionAttendanceStatusValue = "present" | "absent" | "justified" | "unmarked"

interface SessionAttendanceSnapshot {
  presentStudentIds: string[]
  absentStudentIds: string[]
  justifiedStudentIds: string[]
}

export function resolveSessionAttendanceStatus(
  session: SessionAttendanceSnapshot | null | undefined,
  userId: string
): SessionAttendanceStatusValue {
  if (!session) {
    return "unmarked"
  }

  if (session.presentStudentIds.includes(userId)) {
    return "present"
  }

  if (session.absentStudentIds.includes(userId)) {
    return "absent"
  }

  if (session.justifiedStudentIds.includes(userId)) {
    return "justified"
  }

  return "unmarked"
}

export function countSessionAttendanceStatuses(session: SessionAttendanceSnapshot | null | undefined) {
  return {
    present: session?.presentStudentIds.length ?? 0,
    absent: session?.absentStudentIds.length ?? 0,
    justified: session?.justifiedStudentIds.length ?? 0,
  }
}

export function listMarkedAttendanceUserIds(session: SessionAttendanceSnapshot) {
  return Array.from(
    new Set([
      ...session.presentStudentIds,
      ...session.absentStudentIds,
      ...session.justifiedStudentIds,
    ])
  )
}

export function listCountedAttendanceUserIds(session: SessionAttendanceSnapshot) {
  return Array.from(new Set([...session.presentStudentIds, ...session.absentStudentIds]))
}

export function calculateAttendanceRate(input: {
  presentCount: number
  absentCount: number
}) {
  const totalCounted = input.presentCount + input.absentCount
  return totalCounted === 0 ? 0 : Math.round((input.presentCount / totalCounted) * 100)
}
