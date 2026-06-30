'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { mockEmployees, mockJoinRequests } from '@/mock/employees'
import type { EmploymentStatus } from '@/types'
import styles from './page.module.css'

type MainTab = 'employees' | 'requests'

const DOW = ['월', '화', '수', '목', '금', '토', '일']

export default function EmployeesPage() {
  const router = useRouter()
  const [mainTab, setMainTab] = useState<MainTab>('employees')
  const [statusFilter, setStatusFilter] = useState<EmploymentStatus>('ACTIVE')
  const [requests, setRequests] = useState(mockJoinRequests)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteSent, setInviteSent] = useState(false)

  const visibleEmployees = mockEmployees.filter((e) => e.status === statusFilter)

  function closeInvite() {
    setInviteOpen(false)
    setInvitePhone('')
    setInviteSent(false)
  }

  function sendInvite() {
    setInviteSent(true)
    setTimeout(closeInvite, 1800)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>직원 관리</h1>
        <div className={styles.viewTabs}>
          <button
            className={mainTab === 'employees' ? styles.tabActive : styles.tab}
            onClick={() => setMainTab('employees')}
          >
            직원
          </button>
          <button
            className={mainTab === 'requests' ? styles.tabActive : styles.tab}
            onClick={() => setMainTab('requests')}
          >
            가입 신청
            {requests.length > 0 && <span className={styles.tabBadge}>{requests.length}</span>}
          </button>
        </div>
      </header>

      {mainTab === 'employees' && (
        <>
          <div className={styles.filterRow}>
            {(['ACTIVE', 'INACTIVE'] as EmploymentStatus[]).map((s) => (
              <button
                key={s}
                className={statusFilter === s ? styles.chipActive : styles.chip}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'ACTIVE' ? '재직중' : '퇴직'}
              </button>
            ))}
          </div>

          <div className={styles.cardGrid}>
            {visibleEmployees.length === 0 ? (
              <p className={styles.emptyText}>
                {statusFilter === 'ACTIVE' ? '재직중인 직원이 없습니다.' : '퇴직한 직원이 없습니다.'}
              </p>
            ) : (
              visibleEmployees.map((emp) => (
                <button
                  key={emp.id}
                  className={styles.empCard}
                  onClick={() => router.push(`/owner/employees/${emp.id}`)}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.avatar}>{emp.name[0]}</div>
                    <span className={`${styles.statusBadge} ${emp.status === 'ACTIVE' ? styles.badge_ACTIVE : styles.badge_INACTIVE}`}>
                      {emp.status === 'ACTIVE' ? '재직중' : '퇴직'}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <span className={styles.empName}>{emp.name}</span>
                    <span className={styles.empPhone}>{emp.phone}</span>
                  </div>
                  {emp.schedule && (
                    <div className={styles.cardFooter}>
                      <div className={styles.dowRow}>
                        {DOW.map((d, i) => (
                          <span
                            key={i}
                            className={`${styles.dowDot} ${emp.schedule!.days.includes(i) ? styles.dowDotOn : ''}`}
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                      <span className={styles.timeRange}>
                        {emp.schedule.startTime} ~ {emp.schedule.endTime}
                      </span>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          <button className={styles.fab} onClick={() => setInviteOpen(true)}>
            + 직원 초대
          </button>
        </>
      )}

      {mainTab === 'requests' && (
        <div className={styles.list}>
          {requests.length === 0 ? (
            <p className={styles.emptyText}>새로운 가입 신청이 없습니다.</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className={styles.requestCard}>
                <div className={styles.requestInfo}>
                  <span className={styles.requestName}>{req.name}</span>
                  <span className={styles.requestMeta}>{req.phone} · {req.requestedAt}</span>
                  {req.message && <span className={styles.requestMsg}>"{req.message}"</span>}
                </div>
                <div className={styles.requestBtns}>
                  <button
                    className={styles.btnReject}
                    onClick={() => setRequests((prev) => prev.filter((r) => r.id !== req.id))}
                  >
                    거절
                  </button>
                  <button
                    className={styles.btnApprove}
                    onClick={() => setRequests((prev) => prev.filter((r) => r.id !== req.id))}
                  >
                    수락
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {inviteOpen && (
        <div className={styles.sheetOverlay} onClick={closeInvite}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHandle} />
            <div className={styles.sheetHead}>
              <span className={styles.sheetTitle}>직원 초대</span>
              <button className={styles.sheetClose} onClick={closeInvite}>닫기</button>
            </div>
            <div className={styles.sheetBody}>
              {inviteSent ? (
                <div className={styles.inviteSuccess}>
                  <p className={styles.inviteSuccessTitle}>초대장을 보냈습니다</p>
                  <p className={styles.inviteSuccessDesc}>{invitePhone}로 초대 링크를 전송했습니다.</p>
                </div>
              ) : (
                <>
                  <p className={styles.inviteDesc}>전화번호를 입력하면 초대 링크를 문자로 발송합니다.</p>
                  <input
                    type="tel"
                    placeholder="010-0000-0000"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    className={styles.phoneInput}
                  />
                  <button
                    className={styles.btnPrimary}
                    disabled={invitePhone.replace(/\D/g, '').length < 10}
                    onClick={sendInvite}
                  >
                    초대장 보내기
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
