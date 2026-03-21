export interface TeacherAppHomeStat {
  title: string
  value: string
  description: string
}

export interface TeacherAppUpcomingClass {
  id: string
  classGroupId: string
  name: string
  dayLabel: string
  startTime: string
  endTime: string
  teacherLabel: string
  modalityLabel: string
  studentCount: number
}

export interface TeacherAppHomeData {
  role: "teacher"
  teacher: {
    id: string
    name: string
    roleTitle: string | null
    modalities: string[]
  }
  stats: TeacherAppHomeStat[]
  upcomingClasses: TeacherAppUpcomingClass[]
}

export interface TeacherAppAttendanceData {
  role: "teacher"
  teacherId: string
  classOptions: TeacherAppUpcomingClass[]
  sessions: Array<{
    id: string
    classGroupId: string
    className: string
    sessionDate: string
    dateLabel: string
    dayLabel: string
    weekday: number
    timeLabel: string
    isFinalized: boolean
    students: Array<{
      id: string
      name: string
      belt: string
      modalityName: string
      attendanceStatus: "present" | "absent" | "justified" | "unmarked"
    }>
  }>
}

export interface TeacherAppClassesData {
  role: "teacher"
  teacherId: string
  classes: Array<
    TeacherAppUpcomingClass & {
      students: Array<{
        id: string
        name: string
        belt: string
        modalityName: string
        attendance: number
      }>
    }
  >
}

export interface TeacherAppAgendaData {
  role: "teacher"
  teacherId: string
  schedule: Array<{
    day: string
    classes: string[]
  }>
}

export interface TeacherAppEvolutionData {
  role: "teacher"
  teacherId: string
  permissions: {
    manageGraduations: boolean
  }
  metrics: {
    eligibleStudents: number
    scheduledExams: number
    promotions: number
  }
  eligibleStudents: Array<{
    studentActivityId: string
    studentId: string
    studentName: string
    activityLabel: string
    currentBelt: string
    nextBelt: string | null
    attendanceRate: number
    monthsAtCurrentBelt: number
    eligible: boolean
    manualEligibleOverride: boolean | null
  }>
  exams: Array<{
    id: string
    title: string
    date: string
    time: string
    location: string | null
    status: "scheduled" | "in_progress" | "completed" | "cancelled"
    candidateCount: number
  }>
  history: Array<{
    id: string
    studentId: string
    studentName: string
    fromBelt: string | null
    toBelt: string
    date: string
    evaluatorName: string
  }>
}

export interface TeacherAppEventsData {
  role: "teacher"
  teacherId: string
  permissions: {
    manageEvents: boolean
  }
  availableParticipants: Array<{
    id: string
    userId: string
    name: string
    email: string | null
    role: "athlete" | "staff"
    modality: string
  }>
  metrics: {
    upcoming: number
    coordinating: number
    studentsLinked: number
  }
  upcomingEvents: Array<{
    id: string
    name: string
    type: "competition" | "seminar" | "graduation_exam" | "workshop" | "festival" | "special_class"
    date: string
    time: string
    location: string
    notes: string | null
    organizer: string | null
    modality: string
    status: "scheduled" | "completed" | "cancelled"
    registrationsOpen: boolean
    capacity: number
    participantCount: number
    isCoordinator: boolean
    hasRegistrationFee: boolean
    registrationFeeAmountLabel: string | null
    participants: Array<{
      id: string
      userId: string
      name: string
      role: "athlete" | "staff"
      modality: string
      status: "invited" | "confirmed" | "maybe" | "declined" | "payment_pending"
      paymentStatus: "pending" | "paid" | "overdue" | "cancelled" | null
    }>
  }>
  participatingEvents: Array<{
    id: string
    name: string
    date: string
    time: string
    location: string
    status: "scheduled" | "completed" | "cancelled"
  }>
  pastEvents: Array<{
    id: string
    name: string
    type: "competition" | "seminar" | "graduation_exam" | "workshop" | "festival" | "special_class"
    date: string
    participantCount: number
    modality: string
  }>
}

export interface TeacherAppProfileData {
  role: "teacher"
  teacherId: string
  profile: {
    name: string
    email: string
    phone: string
    address: string
    birthDate: string
    rank: string
    roleTitle: string
    registry: string
    bio: string
    modalities: Array<{
      id: string
      name: string
    }>
  }
  stats: {
    activeStudents: number
    activeClasses: number
    monthlyClasses: number
  }
  certifications: Array<{
    id: string
    name: string
    date: string
  }>
}

export interface TeacherAppProfileUpdateInput {
  name: string
  email: string
  phone: string
  address: string
  birthDate: string
  registry: string
  bio: string
}

export interface TeacherAppProfileGraduationsData {
  role: "teacher"
  teacherId: string
  activities: Array<{
    id: string
    activityCategory: string | null
    activityLabel: string
    currentBelt: string
    currentStripes: number
    beltColorHex: string | null
    levels: Array<{
      name: string
      colorHex: string
      stripes: number
    }>
    history: Array<{
      id: string
      activityCategory: string | null
      activityLabel: string
      belt: string
      stripes: number
      date: string
      notes: string | null
    }>
  }>
}

export interface TeacherAppProfileTitlesData {
  role: "teacher"
  teacherId: string
  athlete: {
    id: string
    name: string
    belt: string
    primaryActivityLabel: string
  }
  titles: Array<{
    id: string
    placement: "gold" | "silver" | "bronze" | "champion" | "runner_up" | null
    title: string
    competition: string
    year: number
  }>
}
