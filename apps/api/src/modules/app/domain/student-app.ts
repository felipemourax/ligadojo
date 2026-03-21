export interface StudentAppHomeStat {
  title: string
  value: string
  description: string
}

export interface StudentAppAcademyActivity {
  value: string
  label: string
}

export interface StudentAppClassItem {
  id: string
  name: string
  modalityName: string
  teacherName: string
  dayLabel: string
  timeLabel: string
  attendanceRate: number
  totalClasses: number
  currentStudents: number
  maxStudents: number
  joined: boolean
}

export interface StudentAppHomeData {
  role: "student"
  student: {
    id: string
    name: string
    planName: string | null
    paymentStatus: "paid" | "pending" | "overdue"
  }
  academyActivities: StudentAppAcademyActivity[]
  stats: StudentAppHomeStat[]
  classes: StudentAppClassItem[]
}

export interface StudentAppAttendanceData {
  role: "student"
  studentId: string
  attendance: Array<{
    id: string
    date: string
    className: string
    time: string
    status: "present" | "absent" | "justified"
    activityLabel: string
  }>
}

export interface StudentAppClassesData {
  role: "student"
  studentId: string
  academyActivities: StudentAppAcademyActivity[]
  classes: StudentAppClassItem[]
}

export interface StudentAppProgressData {
  role: "student"
  studentId: string
  activities: Array<{
    id: string
    activityCategory: string | null
    activityLabel: string
    belt: string
    stripes: number
    attendanceRate: number
    practicedModalities: string[]
    enrolledClasses: string[]
    graduationHistory: Array<{
      id: string
      date: string
      from: string | null
      to: string
      evaluator: string
    }>
  }>
}

export interface StudentAppPaymentsData {
  role: "student"
  studentId: string
  planName: string | null
  paymentStatus: "paid" | "pending" | "overdue"
  lastPayment: string | null
  nextPayment: string | null
  amountLabel: string | null
  currentCharge: {
    id: string
    description: string
    dueDate: string
    status: "pending" | "overdue"
    amountLabel: string
    originalAmountLabel: string | null
    discountAmountLabel: string | null
    appliedCouponCode: string | null
    appliedCouponTitle: string | null
  } | null
}

export interface StudentAppEventItem {
  id: string
  name: string
  type: "competition" | "seminar" | "graduation_exam" | "workshop" | "festival" | "special_class"
  sourceStatus: "scheduled" | "completed" | "cancelled"
  date: string
  time: string
  location: string
  description: string | null
  status: "open" | "full" | "closed" | "cancelled"
  enrollmentStatus: "invited" | "payment_pending" | "confirmed" | "maybe" | "declined" | null
  modalityName: string
  participantCount: number
  capacity: number
  registrationsOpen: boolean
  hasRegistrationFee: boolean
  registrationFeeAmountLabel: string | null
  paymentStatus: "pending" | "paid" | "overdue" | "cancelled" | null
  isCoordinatorEvent: boolean
}

export interface StudentAppEventsData {
  role: "student"
  studentId: string
  upcomingEvents: StudentAppEventItem[]
  myEvents: StudentAppEventItem[]
  pastEvents: StudentAppEventItem[]
}

export interface StudentAppPlansData {
  role: "student"
  studentId: string
  currentPlanId: string | null
  currentPlanName: string | null
  pendingPlanId: string | null
  pendingPlanName: string | null
  pendingPlanEffectiveDate: string | null
  activationBillingDay: number
  nextBillingDate: string | null
  canActivateNewPlan: boolean
  planTransitionPolicy: "immediate" | "next_cycle" | "prorata"
  planTransitionPolicyLabel: string
  planTransitionChargeHandling:
    | "replace_open_charge"
    | "charge_difference"
    | "convert_to_credit"
  planTransitionChargeHandlingLabel: string
  plans: Array<{
    id: string
    name: string
    amountLabel: string
    billingCycleLabel: string
    modalityNames: string[]
    isCurrent: boolean
  }>
}

export interface StudentAppProfileGraduationsData {
  role: "student"
  studentId: string
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

export interface StudentAppProfileTitlesData {
  role: "student"
  studentId: string
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

export interface StudentAppNavigationIndicatorsData {
  role: "student"
  studentId: string
  paymentsBadgeCount: number
  eventsBadgeCount: number
  eventInvitesCount: number
  eventUpcomingCount: number
}
