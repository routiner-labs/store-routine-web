import type { Employee, JoinRequest } from '@/types'

export const mockEmployees: Employee[] = [
  {
    id: 'emp1',
    name: '김민수',
    phone: '010-1234-5678',
    birthDate: '1998-03-15',
    status: 'ACTIVE',
    hiredAt: '2025-03-01',
    schedule: { days: [0, 1, 2, 3, 4], startTime: '09:00', endTime: '18:00' },
  },
  {
    id: 'emp2',
    name: '이지은',
    phone: '010-2345-6789',
    birthDate: '2000-11-22',
    status: 'ACTIVE',
    hiredAt: '2025-05-15',
    schedule: { days: [1, 2, 3, 4, 5], startTime: '16:00', endTime: '22:00' },
  },
  {
    id: 'emp3',
    name: '박서연',
    phone: '010-3456-7890',
    birthDate: '1999-07-08',
    status: 'ACTIVE',
    hiredAt: '2025-01-10',
    schedule: { days: [2, 3, 5, 6], startTime: '11:00', endTime: '20:00' },
  },
  {
    id: 'emp4',
    name: '최준호',
    phone: '010-4567-8901',
    birthDate: '1997-05-30',
    status: 'INACTIVE',
    hiredAt: '2024-08-20',
    terminatedAt: '2026-04-30',
    schedule: { days: [0, 1, 2], startTime: '09:00', endTime: '15:00' },
  },
]

export const mockJoinRequests: JoinRequest[] = [
  {
    id: 'req1',
    name: '정유진',
    phone: '010-5678-9012',
    requestedAt: '2026-06-28',
    message: '주말 오전 근무 가능합니다.',
  },
  {
    id: 'req2',
    name: '한태양',
    phone: '010-6789-0123',
    requestedAt: '2026-06-29',
  },
]
