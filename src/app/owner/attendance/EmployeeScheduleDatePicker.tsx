'use client'

import { useEffect, useId, useRef, useState } from 'react'
import styles from './EmployeeScheduleDatePicker.module.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const WEEKDAY_HEADERS = ['월', '화', '수', '목', '금', '토', '일']

type EmployeeScheduleDatePickerProps = {
  value: string
  today: string
  onChange: (value: string) => void
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatTriggerDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()]
  return `${month}월 ${day}일 (${weekday})`
}

function getMonthGrid(year: number, month: number) {
  const offset = (new Date(year, month - 1, 1).getDay() + 6) % 7
  const days = new Date(year, month, 0).getDate()
  const grid: Array<number | null> = Array(offset).fill(null)
  for (let day = 1; day <= days; day += 1) grid.push(day)
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

function moveMonth(year: number, month: number, amount: number) {
  const date = new Date(year, month - 1 + amount, 1)
  return { year: date.getFullYear(), month: date.getMonth() + 1 }
}

export default function EmployeeScheduleDatePicker({
  value,
  today,
  onChange,
}: EmployeeScheduleDatePickerProps) {
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(() => Number(value.slice(0, 4)))
  const [month, setMonth] = useState(() => Number(value.slice(5, 7)))
  const pickerRef = useRef<HTMLDivElement>(null)
  const dialogId = useId()

  function close() {
    setOpen(false)
  }

  function openPicker() {
    const [selectedYear, selectedMonth] = value.split('-').map(Number)
    setYear(selectedYear)
    setMonth(selectedMonth)
    setOpen(true)
  }

  function changeMonth(amount: number) {
    const next = moveMonth(year, month, amount)
    setYear(next.year)
    setMonth(next.month)
  }

  function selectDate(day: number) {
    onChange(formatDate(year, month, day))
    close()
  }

  useEffect(() => {
    if (!open) return undefined

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }

    function handlePointerDown(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) close()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [open])

  return (
    <div className={styles.root} ref={pickerRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-label="조정 날짜"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        onClick={open ? close : openPicker}
      >
        {formatTriggerDate(value)}
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div id={dialogId} className={styles.dialog} role="dialog" aria-label="조정 날짜 선택">
          <div className={styles.header}>
            <button type="button" className={styles.navButton} aria-label="이전 달" onClick={() => changeMonth(-1)}>
              ‹
            </button>
            <strong>{year}년 {month}월</strong>
            <button type="button" className={styles.navButton} aria-label="다음 달" onClick={() => changeMonth(1)}>
              ›
            </button>
          </div>
          <div className={styles.grid}>
            {WEEKDAY_HEADERS.map((weekday, index) => (
              <span
                key={weekday}
                className={`${styles.weekday} ${index === 5 ? styles.saturday : index === 6 ? styles.sunday : ''}`}
              >
                {weekday}
              </span>
            ))}
            {getMonthGrid(year, month).map((day, index) => {
              if (!day) return <span key={`empty-${index}`} aria-hidden="true" />
              const date = formatDate(year, month, day)
              const weekdayIndex = index % 7
              const selected = date === value
              const isToday = date === today
              return (
                <button
                  key={date}
                  type="button"
                  className={`${styles.day} ${selected ? styles.selected : ''} ${isToday ? styles.today : ''} ${
                    weekdayIndex === 5 ? styles.saturday : weekdayIndex === 6 ? styles.sunday : ''
                  }`}
                  aria-label={`${year}년 ${month}월 ${day}일 선택`}
                  aria-pressed={selected}
                  aria-current={isToday ? 'date' : undefined}
                  onClick={() => selectDate(day)}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
