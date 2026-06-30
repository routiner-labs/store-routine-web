import type { AttendanceStatus, CalendarRecord } from '@/types'

type EmployeeDef = {
  id: string
  name: string
  start: string
  end: string
  clockedIn: string
  days: number[] // 0=Sun, 1=Mon, ..., 6=Sat
}

const EMPLOYEES: EmployeeDef[] = [
  { id: 'emp1', name: '김민수', start: '09:00', end: '18:00', clockedIn: '08:57', days: [1, 2, 3, 4, 5] },
  { id: 'emp2', name: '이지은', start: '16:00', end: '22:00', clockedIn: '15:58', days: [2, 3, 4, 5, 6] },
  { id: 'emp3', name: '박서연', start: '11:00', end: '20:00', clockedIn: '11:02', days: [3, 4, 6, 0] },
  { id: 'emp4', name: '최준호', start: '09:00', end: '15:00', clockedIn: '09:04', days: [1, 2, 3] },
]

type Override = { status: AttendanceStatus; clockedIn?: string }

const OVERRIDES: Record<string, Override> = {
  '2026-06-05-emp2': { status: 'LATE', clockedIn: '16:25' },
  '2026-06-10-emp1': { status: 'ABSENT' },
  '2026-06-12-emp3': { status: 'LATE', clockedIn: '11:35' },
  '2026-06-15-emp4': { status: 'LATE', clockedIn: '09:22' },
  '2026-06-19-emp2': { status: 'ABSENT' },
  '2026-06-22-emp3': { status: 'ABSENT' },
  '2026-06-25-emp1': { status: 'LATE', clockedIn: '09:18' },
  '2026-06-30-emp1': { status: 'CLOCKED_IN', clockedIn: '08:57' },
  '2026-06-30-emp2': { status: 'SCHEDULED' },
  '2026-06-30-emp4': { status: 'CLOCKED_OUT', clockedIn: '09:04' },
}

export function getAttendanceForDate(dateStr: string): CalendarRecord[] {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dayOfWeek = new Date(y, m - 1, d).getDay()

  const records: CalendarRecord[] = []

  for (const emp of EMPLOYEES) {
    if (!emp.days.includes(dayOfWeek)) continue

    const key = `${dateStr}-${emp.id}`
    const override = OVERRIDES[key]
    const status: AttendanceStatus = override?.status ?? 'CLOCKED_OUT'

    records.push({
      employeeId: emp.id,
      employeeName: emp.name,
      scheduledStart: emp.start,
      scheduledEnd: emp.end,
      status,
      clockedIn:
        status !== 'ABSENT' && status !== 'SCHEDULED'
          ? (override?.clockedIn ?? emp.clockedIn)
          : undefined,
      clockedOut: status === 'CLOCKED_OUT' ? emp.end : undefined,
    })
  }

  return records
}
