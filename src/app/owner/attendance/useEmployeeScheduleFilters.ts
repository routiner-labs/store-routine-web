'use client'

import { useMemo, useState } from 'react'

export type EmployeeShift = {
  startTime: string
  endTime: string
} | null

type TimeMessageKind = 'none' | 'info' | 'error'

export type ScheduleFilterControls = {
  advancedOpen: boolean
  hasActiveFilters: boolean
  searchText: string
  draftStart: string
  draftEnd: string
  canApplyAdvanced: boolean
  timeMessage: string
  timeMessageKind: TimeMessageKind
  setSearchText: (value: string) => void
  setDraftStart: (value: string) => void
  setDraftEnd: (value: string) => void
  applySearch: () => void
  applyAdvancedSearch: () => void
  toggleAdvanced: () => void
  resetFilters: () => void
}

function toMinutes(value: string) {
  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

function overlaps(
  shift: Exclude<EmployeeShift, null>,
  rangeStart: string,
  rangeEnd: string,
) {
  const shiftStart = toMinutes(shift.startTime)
  const shiftEnd = toMinutes(shift.endTime)
  const filterStart = toMinutes(rangeStart)
  const filterEnd = toMinutes(rangeEnd)
  return shiftStart < filterEnd && shiftEnd > filterStart
}

export function useEmployeeScheduleFilters<T extends { name: string }>(
  employees: T[],
  getShift: (employee: T) => EmployeeShift,
): {
  visibleEmployees: T[]
  controls: ScheduleFilterControls
} {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [draftStart, setDraftStart] = useState('')
  const [draftEnd, setDraftEnd] = useState('')
  const [appliedStart, setAppliedStart] = useState('')
  const [appliedEnd, setAppliedEnd] = useState('')

  const timeMessageKind: TimeMessageKind = !draftStart && !draftEnd
    ? 'none'
    : !draftStart || !draftEnd
      ? 'info'
      : toMinutes(draftEnd) <= toMinutes(draftStart)
        ? 'error'
        : 'none'
  const timeMessage = timeMessageKind === 'info'
    ? '시작과 종료 시간을 모두 입력하세요.'
    : timeMessageKind === 'error' ? '종료 시간은 시작 시간보다 늦어야 합니다.' : ''
  const canApplyAdvanced = timeMessageKind === 'none'
  const hasActiveFilters = Boolean(appliedSearch.trim() || appliedStart || appliedEnd)
  const visibleEmployees = useMemo(() => {
    const query = appliedSearch.trim().toLocaleLowerCase('ko-KR')
    return employees.filter((employee) => {
      if (query && !employee.name.toLocaleLowerCase('ko-KR').includes(query)) return false
      if (!appliedStart || !appliedEnd) return true
      const shift = getShift(employee)
      return shift !== null && overlaps(shift, appliedStart, appliedEnd)
    })
  }, [appliedEnd, appliedSearch, appliedStart, employees, getShift])

  return {
    visibleEmployees,
    controls: {
      advancedOpen,
      hasActiveFilters,
      searchText,
      draftStart,
      draftEnd,
      canApplyAdvanced,
      timeMessage,
      timeMessageKind,
      setSearchText,
      setDraftStart,
      setDraftEnd,
      applySearch: () => setAppliedSearch(searchText),
      applyAdvancedSearch: () => {
        if (!canApplyAdvanced) return
        setAppliedSearch(searchText)
        setAppliedStart(draftStart)
        setAppliedEnd(draftEnd)
      },
      toggleAdvanced: () => setAdvancedOpen((open) => !open),
      resetFilters: () => {
        setSearchText('')
        setAppliedSearch('')
        setDraftStart('')
        setDraftEnd('')
        setAppliedStart('')
        setAppliedEnd('')
      },
    },
  }
}
