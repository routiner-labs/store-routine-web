'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LiaUserPlusSolid, LiaAngleRightSolid, LiaSearchSolid, LiaSlidersHSolid, LiaTimesSolid } from 'react-icons/lia'
import { mockEmployees, mockJoinRequests } from '@/mock/employees'
import type { EmploymentStatus } from '@/types'
import styles from './page.module.css'

const DOW = ['월', '화', '수', '목', '금', '토', '일']

export default function EmployeesPage() {
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState<EmploymentStatus | 'ALL'>('ALL')
  const [filterDays, setFilterDays] = useState<number[]>([])
  const [advOpen, setAdvOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteSent, setInviteSent] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  const advActiveCount =
    (filterStatus !== 'ALL' ? 1 : 0) +
    (filterDays.length > 0 ? 1 : 0) +
    (appliedSearch.trim() ? 1 : 0)

  function resetAdv() {
    setFilterStatus('ALL')
    setFilterDays([])
    setAppliedSearch('')
    setSearchText('')
  }

  function toggleDay(i: number) {
    setFilterDays((prev) => prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i])
  }

  const q = appliedSearch.trim().toLowerCase()

  const visibleEmployees = mockEmployees
    .filter((e) => filterStatus === 'ALL' || e.status === filterStatus)
    .filter((e) => !q || e.name.toLowerCase().includes(q) || e.phone.includes(q))
    .filter((e) => filterDays.length === 0 || (e.schedule && filterDays.some((d) => e.schedule!.days.includes(d))))

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
        <div className={styles.headerSearch}>
          <div className={styles.searchWrap}>
            <LiaSearchSolid className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="이름 / 전화번호"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setAppliedSearch(searchText) }}
            />
          </div>
          <button
            className={styles.searchBtn}
            onClick={() => setAppliedSearch(searchText)}
          >
            검색
          </button>
        </div>
        <button
          className={`${styles.advBtn} ${advOpen || advActiveCount > 0 ? styles.advBtnActive : ''}`}
          onClick={() => setAdvOpen((v) => !v)}
        >
          <LiaSlidersHSolid />
          <span className={styles.advBtnLabel}>세부 검색</span>
        </button>
      </header>

      <div className={`${styles.advPanel} ${advOpen ? styles.advPanelOpen : ''}`}>
        <div className={styles.advRow}>
          <span className={styles.advLabel}>이름/전화</span>
          <div className={styles.advSearchWrap}>
            <div className={styles.searchWrap}>
              <LiaSearchSolid className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="이름 / 전화번호"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') setAppliedSearch(searchText) }}
              />
            </div>
            <button className={styles.searchBtn} onClick={() => setAppliedSearch(searchText)}>검색</button>
            <button className={styles.advResetBtn} onClick={resetAdv}>
              <LiaTimesSolid /> 필터 초기화
            </button>
          </div>
        </div>

        <div className={styles.advRow}>
          <span className={styles.advLabel}>상태</span>
          <div className={styles.advChips}>
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((s) => (
              <button
                key={s}
                className={`${styles.chip} ${filterStatus === s ? styles.chipActive : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === 'ALL' ? '전체' : s === 'ACTIVE' ? '재직중' : '퇴직'}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.advRow}>
          <span className={styles.advLabel}>근무요일</span>
          <div className={styles.advChips}>
            {DOW.map((d, i) => (
              <button
                key={i}
                className={`${styles.chip} ${filterDays.includes(i) ? styles.chipActive : ''}`}
                onClick={() => toggleDay(i)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mockJoinRequests.length > 0 && (
        <Link href="/owner/employees/join-requests" className={styles.joinBanner}>
          <span className={styles.joinBannerText}>
            가입 신청 <strong>{mockJoinRequests.length}건</strong> 대기 중
          </span>
          <LiaAngleRightSolid className={styles.joinBannerArrow} />
        </Link>
      )}

      <div className={styles.cardGrid}>
        {visibleEmployees.length === 0 ? (
          <p className={styles.emptyText}>
            {filterStatus === 'INACTIVE' ? '퇴직한 직원이 없습니다.' : '재직중인 직원이 없습니다.'}
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
        <LiaUserPlusSolid /> 직원 초대
      </button>

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
