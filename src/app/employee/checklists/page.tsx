'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LiaAngleRightSolid, LiaCheckSolid, LiaClockSolid, LiaSearchSolid, LiaTimesSolid } from 'react-icons/lia'
import { createTasksForDate, type StoreTask, type TaskKind } from '@/mock/tasks'
import styles from './page.module.css'

const TODAY = '2026-06-30'
const ME_ID = 'emp2'

type SummaryFilter = 'ALL' | 'COMMON' | 'EXTRA' | 'DONE' | 'PENDING'

function describeTiming(task: StoreTask) {
  if (task.timing.start && task.timing.end) return `${task.timing.start} ~ ${task.timing.end}`
  if (task.timing.start) return `${task.timing.start}부터`
  if (task.timing.end) return `${task.timing.end}까지`
  return '상시'
}

export default function EmployeeChecklistsPage() {
  const [tasks, setTasks] = useState(() =>
    createTasksForDate(TODAY).filter((task) => task.assigneeIds.includes(ME_ID))
  )
  const [summaryFilter, setSummaryFilter] = useState<SummaryFilter>('ALL')
  const [queries, setQueries] = useState<Record<TaskKind, string>>({ COMMON: '', EXTRA: '' })

  const commonTasks = tasks.filter((task) => task.kind === 'COMMON')
  const extraTasks = tasks.filter((task) => task.kind === 'EXTRA')
  const doneCount = tasks.filter((task) => task.done).length
  const summary = [
    { key: 'ALL' as const, label: '전체', value: tasks.length, className: '' },
    { key: 'COMMON' as const, label: '공통', value: commonTasks.length, className: styles.sumCommon },
    { key: 'EXTRA' as const, label: '추가', value: extraTasks.length, className: styles.sumExtra },
    { key: 'DONE' as const, label: '완료', value: doneCount, className: styles.sumDone },
    { key: 'PENDING' as const, label: '미완료', value: tasks.length - doneCount, className: styles.sumPending },
  ]

  function matchesSummary(task: StoreTask) {
    if (summaryFilter === 'COMMON') return task.kind === 'COMMON'
    if (summaryFilter === 'EXTRA') return task.kind === 'EXTRA'
    if (summaryFilter === 'DONE') return task.done
    if (summaryFilter === 'PENDING') return !task.done
    return true
  }

  function toggleDone(taskId: string) {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task))
    )
  }

  function renderSection(kind: TaskKind, title: string, description: string, items: StoreTask[]) {
    const query = queries[kind].trim().toLowerCase()
    const filtered = items
      .filter(matchesSummary)
      .filter((task) => !query || task.title.toLowerCase().includes(query))

    return (
      <section className={styles.taskSection}>
        <div className={styles.sectionHead}>
          <div>
            <h2 className={styles.sectionTitle}>{title}</h2>
            <p className={styles.sectionDescription}>{description}</p>
          </div>
          <span className={styles.sectionCount}>{filtered.length}</span>
        </div>
        <div className={styles.taskSearch}>
          <LiaSearchSolid className={styles.taskSearchIcon} />
          <input
            className={styles.taskSearchInput}
            type="text"
            placeholder="업무 이름 검색"
            value={queries[kind]}
            onChange={(event) => setQueries((current) => ({ ...current, [kind]: event.target.value }))}
          />
          {queries[kind] && (
            <button
              className={styles.taskSearchClear}
              onClick={() => setQueries((current) => ({ ...current, [kind]: '' }))}
              aria-label={`${title} 검색어 지우기`}
            >
              <LiaTimesSolid />
            </button>
          )}
        </div>
        <div className={styles.taskList}>
          {filtered.length === 0 ? (
            <p className={styles.emptyText}>
              {query ? '검색 결과가 없습니다.' : '해당하는 업무가 없습니다.'}
            </p>
          ) : (
            filtered.map((task) => (
              <div key={task.id} className={`${styles.task} ${task.done ? styles.taskDone : ''}`}>
                <button
                  className={`${styles.taskCheck} ${task.done ? styles.taskCheckDone : ''}`}
                  onClick={() => toggleDone(task.id)}
                  aria-label={task.done ? `${task.title} 완료 취소` : `${task.title} 완료 처리`}
                >
                  {task.done && <LiaCheckSolid />}
                </button>
                <Link href={`/employee/checklist/${task.catalogId}`} className={styles.taskMain}>
                  <span className={styles.taskTitle}>{task.title}</span>
                  <span className={styles.taskTiming}>
                    <LiaClockSolid />{describeTiming(task)}
                  </span>
                </Link>
                <LiaAngleRightSolid className={styles.taskArrow} />
              </div>
            ))
          )}
        </div>
      </section>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>업무리스트</h1>
        <div className={styles.periodNav}>
          <span className={styles.periodLabel}>2026년 6월 30일 화요일</span>
        </div>
      </header>

      <div className={styles.summary}>
        {summary.map((item) => (
          <button
            key={item.key}
            className={`${styles.summaryItem} ${summaryFilter === item.key ? styles.summaryItemActive : ''}`}
            onClick={() => setSummaryFilter(summaryFilter === item.key ? 'ALL' : item.key)}
          >
            <span className={`${styles.summaryNum} ${item.className}`}>{item.value}</span>
            <span className={styles.summaryLabel}>{item.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.taskArea}>
        {renderSection('COMMON', '공통 업무 리스트', '반복 일정으로 배정된 기본 업무입니다.', commonTasks)}
        {renderSection('EXTRA', '추가 업무 리스트', '오늘 추가로 배정된 업무입니다.', extraTasks)}
      </div>
    </div>
  )
}
