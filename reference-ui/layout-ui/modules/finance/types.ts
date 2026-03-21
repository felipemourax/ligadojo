// Types for Finance Module
export interface Payment {
  id: string
  studentId: string
  amount: number
  dueDate: string
  paidDate?: string
  status: PaymentStatus
  method?: PaymentMethod
  reference?: string
  description?: string
  planId?: string
  invoiceUrl?: string
  createdAt: string
  updatedAt: string
}

export type PaymentStatus = "pending" | "paid" | "overdue" | "cancelled" | "refunded"

export type PaymentMethod = "pix" | "credit_card" | "debit_card" | "bank_slip" | "cash" | "transfer"

export interface Invoice {
  id: string
  studentId: string
  payments: Payment[]
  totalAmount: number
  status: InvoiceStatus
  issuedDate: string
  dueDate: string
  paidDate?: string
  invoiceNumber: string
  createdAt: string
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled"

export interface FinancialSummary {
  totalRevenue: number
  pendingPayments: number
  overduePayments: number
  averageTicket: number
  growth: number
  byMonth: MonthlyRevenue[]
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  expenses: number
  profit: number
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: ExpenseCategory
  date: string
  recurring: boolean
  recurrenceFrequency?: "monthly" | "quarterly" | "annual"
  createdAt: string
}

export type ExpenseCategory = 
  | "rent" 
  | "utilities" 
  | "salaries" 
  | "equipment" 
  | "marketing" 
  | "maintenance" 
  | "taxes" 
  | "other"

export interface FinanceFilters {
  studentId?: string
  status?: PaymentStatus
  startDate?: string
  endDate?: string
  method?: PaymentMethod
}
