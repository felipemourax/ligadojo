export interface EnrollStudentEventInput {
  eventId: string
  initialStatus: "confirmed" | "maybe" | "declined"
}
