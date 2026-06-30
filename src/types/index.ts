export type AttendanceStatus = 'SCHEDULED' | 'CLOCKED_IN' | 'CLOCKED_OUT' | 'LATE' | 'ABSENT'
export type TaskStatus = 'PENDING' | 'DONE' | 'SKIPPED' | 'NEEDS_REVIEW'
export type RequestStatus = 'REQUESTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'DONE' | 'REJECTED'
export type CompletionType = 'CHECK' | 'PHOTO' | 'NUMBER' | 'MEMO' | 'SELECT' | 'OWNER_CONFIRM'
export type ChecklistType = 'OPEN' | 'CLOSE' | 'CLEANING' | 'INVENTORY' | 'SPECIAL'
export type RequestType = '재료부족' | '장비고장' | '근무변경' | '고객이슈' | '청소시설' | '기타'
export type InstructionStatus = 'ASSIGNED' | 'READ' | 'DONE' | 'NEEDS_REVIEW'

export interface ChecklistItem {
  id: string
  title: string
  description: string
  completionType: CompletionType
  status: TaskStatus
  value?: string | number
}

export interface Checklist {
  id: string
  title: string
  type: ChecklistType
  items: ChecklistItem[]
}

export interface AttendanceRecord {
  employeeId: string
  employeeName: string
  status: AttendanceStatus
  scheduledStart: string
  scheduledEnd: string
  clockedIn?: string
}

export interface SpecialInstruction {
  id: string
  title: string
  content: string
  assignedTo: string
  status: InstructionStatus
}

export interface EmployeeRequest {
  id: string
  type: RequestType
  content: string
  status: RequestStatus
  createdAt: string
  employeeName: string
  hasPhoto: boolean
}

export interface Store {
  id: string
  name: string
  address?: string
}

export interface CalendarRecord {
  employeeId: string
  employeeName: string
  scheduledStart: string
  scheduledEnd: string
  status: AttendanceStatus
  clockedIn?: string
  clockedOut?: string
}
