'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LiaAngleRightSolid } from 'react-icons/lia'
import { mockChecklists, mockSpecialInstructions, mockRequests } from '@/mock/data'
import { useToast } from '@/context/ToastContext'
import { useScrollLock } from '@/lib/useScrollLock'
import { usePopupEsc } from '@/lib/usePopupEsc'
import EmployeeName from '@/components/EmployeeName'
import type { SpecialInstruction } from '@/types'
import styles from './page.module.css'

// 데모 직원 페르소나
const ME = '이지은'

const statusLabel: Record<string, string> = {
  REQUESTED: '미확인',
  CONFIRMED: '확인됨',
  IN_PROGRESS: '처리 중',
  DONE: '완료',
  REJECTED: '반려',
}

type ShiftState = 'BEFORE' | 'WORKING' | 'DONE'

export default function EmployeeHome() {
  const { showToast } = useToast()
  const [shiftState, setShiftState] = useState<ShiftState>('BEFORE')
  const [clockedInAt, setClockedInAt] = useState<string | null>(null)
  const [instructions, setInstructions] = useState(mockSpecialInstructions)
  const [openInstruction, setOpenInstruction] = useState<SpecialInstruction | null>(null)

  useScrollLock(openInstruction !== null)
  // 특이사항 상세 — 뷰어형(ESC 바로 닫힘)
  usePopupEsc(openInstruction !== null, 'viewer', () => setOpenInstruction(null))

  const myChecklists = mockChecklists.filter((c) => c.id === '1' || c.id === '3')
  const myInstruction = instructions.find((i) => i.assignedTo === ME)

  const myRequests = mockRequests
    .filter((r) => r.employeeName === ME)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)

  function clockIn() {
    // 데모: 근무 시작 시각으로 출근 처리
    setClockedInAt('15:58')
    setShiftState('WORKING')
    showToast('출근 처리되었습니다')
  }

  function clockOut() {
    setShiftState('DONE')
    showToast('퇴근 처리되었습니다. 수고하셨습니다')
  }

  function completeInstruction(id: string) {
    setInstructions((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'DONE' } : i)))
    setOpenInstruction(null)
    showToast('특별 지시를 완료 처리했습니다')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.greeting}>안녕하세요</p>
          <h1 className={styles.name}><EmployeeName name={ME} /> 님</h1>
        </div>
        <div className={styles.storeBadge}>스타벅스 강남점</div>
      </header>

      <section className={styles.shiftSection}>
        <div className={styles.shiftInfo}>
          <div>
            <p className={styles.shiftLabel}>
              {shiftState === 'BEFORE' && '오늘 근무'}
              {shiftState === 'WORKING' && `근무 중 · ${clockedInAt} 출근`}
              {shiftState === 'DONE' && '근무 완료'}
            </p>
            <p className={styles.shiftTime}>16:00 ~ 22:00</p>
          </div>
          {shiftState === 'BEFORE' && (
            <button className={styles.clockInBtn} onClick={clockIn}>출근하기</button>
          )}
          {shiftState === 'WORKING' && (
            <button className={styles.clockOutBtn} onClick={clockOut}>퇴근하기</button>
          )}
          {shiftState === 'DONE' && (
            <span className={styles.shiftDoneBadge}>퇴근 완료</span>
          )}
        </div>
      </section>

      <div className={styles.contentGrid}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>오늘 할 일</h2>
        <div className={styles.taskList}>
          {myChecklists.map((checklist) => {
            const done = checklist.items.filter((i) => i.status === 'DONE').length
            const total = checklist.items.length
            const percent = Math.round((done / total) * 100)
            return (
              <Link
                key={checklist.id}
                href={`/employee/checklist/${checklist.id}`}
                className={styles.taskCard}
              >
                <div className={styles.taskInfo}>
                  <p className={styles.taskTitle}>{checklist.title}</p>
                  <div className={styles.taskProgressRow}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${percent}%` }} />
                    </div>
                    <span className={styles.progressText}>{done}/{total}</span>
                  </div>
                </div>
                <span className={styles.taskArrow}>›</span>
              </Link>
            )
          })}

          {myInstruction && (
            <button
              className={styles.instructionCard}
              onClick={() => setOpenInstruction(myInstruction)}
            >
              <div className={styles.taskInfo}>
                <p className={styles.instructionLabel}>특별 지시</p>
                <p className={styles.instructionTitle}>{myInstruction.title}</p>
              </div>
              <span className={`${styles.instructionStatus} ${styles[`ist_${myInstruction.status}`]}`}>
                {myInstruction.status === 'DONE' ? '완료' : '확인함'}
              </span>
            </button>
          )}
        </div>
      </section>

      <div className={styles.sideCol}>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>내 요청 현황</h2>
          <Link href="/employee/requests" className={styles.sectionLink}>
            전체 보기 <LiaAngleRightSolid />
          </Link>
        </div>
        <div className={styles.myRequestList}>
          {myRequests.length === 0 ? (
            <p className={styles.emptyText}>보낸 요청이 없습니다.</p>
          ) : (
            myRequests.map((req) => (
              <Link key={req.id} href={`/employee/requests/${req.id}`} className={styles.myRequestRow}>
                <span className={styles.myRequestType}>{req.type}</span>
                <span className={styles.myRequestContent}>{req.content}</span>
                <span className={`${styles.myRequestStatus} ${styles[`status_${req.status}`]}`}>
                  {statusLabel[req.status]}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>요청하기</h2>
        <div className={styles.requestGrid}>
          {[
            { label: '재료 부족', type: '재료부족' },
            { label: '장비 고장', type: '장비고장' },
            { label: '대타 요청', type: '근무변경' },
            { label: '기타', type: '기타' },
          ].map((item) => (
            <Link
              key={item.type}
              href={`/employee/requests/new?type=${item.type}`}
              className={styles.requestBtn}
            >
              <span className={styles.requestLabel}>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
      </div>
      </div>

      {/* 특별 지시 상세 팝업 */}
      {openInstruction && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <span className={styles.popupTitle}>특별 지시</span>
              <button className={styles.popupClose} onClick={() => setOpenInstruction(null)}>닫기</button>
            </div>
            <div className={styles.popupBody}>
              <p className={styles.popupInstructionTitle}>{openInstruction.title}</p>
              <p className={styles.popupInstructionContent}>{openInstruction.content}</p>
              {openInstruction.status !== 'DONE' ? (
                <button
                  className={styles.popupDoneBtn}
                  onClick={() => completeInstruction(openInstruction.id)}
                >
                  완료했어요
                </button>
              ) : (
                <p className={styles.popupDoneText}>완료된 지시입니다.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
