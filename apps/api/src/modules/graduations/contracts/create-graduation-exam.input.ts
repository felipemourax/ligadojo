export interface CreateGraduationExamInput {
  title: string
  trackIds: string[]
  allTracks: boolean
  modalityId: string | null
  date: string
  time: string
  location: string | null
  evaluatorNames: string[]
  allEvaluators: boolean
  notes: string | null
}
