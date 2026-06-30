'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LiaAngleLeftSolid,
  LiaPhoneSolid,
  LiaBirthdayCakeSolid,
  LiaCalendarSolid,
  LiaClockSolid,
  LiaSaveSolid,
  LiaUserMinusSolid,
} from 'react-icons/lia'
import { mockEmployees } from '@/mock/employees'
import styles from './page.module.css'

const DOW = ['월', '화', '수', '목', '금', '토', '일']

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const emp = mockEmployees.find((e) => e.id === id)

  const [name, setName] = useState(emp?.name ?? '')
  const [phone, setPhone] = useState(emp?.phone ?? '')
  const [birthDate, setBirthDate] = useState(emp?.birthDate ?? '')
  const [hiredAt, setHiredAt] = useState(emp?.hiredAt ?? '')
  const [status, setStatus] = useState(emp?.status ?? 'ACTIVE')
  const [days, setDays] = useState(emp?.schedule?.days ?? [])
  const [startTime, setStartTime] = useState(emp?.schedule?.startTime ?? '09:00')
  const [endTime, setEndTime] = useState(emp?.schedule?.endTime ?? '18:00')
  const [saved, setSaved] = useState(false)

  if (!emp) {
    return (
      <div className={styles.notFound}>
        <p>직원 정보를 찾을 수 없습니다.</p>
        <button className={styles.backLink} onClick={() => router.back()}>목록으로</button>
      </div>
    )
  }

  function toggleDay(i: number) {
    setDays((prev) =>
      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i].sort((a, b) => a - b)
    )
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            <LiaAngleLeftSolid /> 직원 관리
          </button>
          <span className={styles.headerTitle}>{name || '직원 상세'}</span>
          <button
            className={`${styles.saveBtn} ${saved ? styles.saveBtnDone : ''}`}
            onClick={handleSave}
          >
            <LiaSaveSolid /> {saved ? '저장됨' : '저장'}
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        {/* 좌측: 프로필 카드 */}
        <aside className={styles.leftPanel}>
          <div className={styles.profileCard}>
            <div className={styles.avatar}>{(name || '?')[0]}</div>
            <div className={styles.profileName}>{name || '-'}</div>
            <span className={`${styles.statusBadge} ${status === 'ACTIVE' ? styles.badge_ACTIVE : styles.badge_INACTIVE}`}>
              {status === 'ACTIVE' ? '재직중' : '퇴직'}
            </span>
            <div className={styles.profileMeta}>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>연락처</span>
                <span className={styles.metaValue}>{phone || '-'}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>입사일</span>
                <span className={styles.metaValue}>{hiredAt || '-'}</span>
              </div>
              {emp.schedule && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>근무시간</span>
                  <span className={styles.metaValue}>{startTime} ~ {endTime}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.leftActions}>
            <button className={styles.btnSave} onClick={handleSave}>
              {saved ? '저장됨' : '저장하기'}
            </button>
            {status === 'ACTIVE' && (
              <button className={styles.btnTerminate} onClick={() => setStatus('INACTIVE')}>
                <LiaUserMinusSolid /> 퇴직 처리
              </button>
            )}
          </div>
        </aside>

        {/* 우측: 폼 영역 */}
        <main className={styles.rightPanel}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>기본 정보</h2>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <label className={styles.label}>이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}><LiaPhoneSolid /> 연락처</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.input}
                  placeholder="010-0000-0000"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}><LiaBirthdayCakeSolid /> 생년월일</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>근무 정보</h2>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <label className={styles.label}>고용 상태</label>
                <div className={styles.statusToggle}>
                  <button
                    className={`${styles.toggleBtn} ${status === 'ACTIVE' ? styles.toggleBtnActive : ''}`}
                    onClick={() => setStatus('ACTIVE')}
                  >
                    재직중
                  </button>
                  <button
                    className={`${styles.toggleBtn} ${status === 'INACTIVE' ? styles.toggleBtnActive : ''}`}
                    onClick={() => setStatus('INACTIVE')}
                  >
                    퇴직
                  </button>
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}><LiaCalendarSolid /> 입사일</label>
                <input
                  type="date"
                  value={hiredAt}
                  onChange={(e) => setHiredAt(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>근무 스케쥴</h2>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <label className={styles.label}>근무 요일</label>
                <div className={styles.dowRow}>
                  {DOW.map((d, i) => (
                    <button
                      key={i}
                      className={`${styles.dowToggle} ${days.includes(i) ? styles.dowToggleOn : ''}`}
                      onClick={() => toggleDay(i)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}><LiaClockSolid /> 근무 시간</label>
                <div className={styles.timeRow}>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.timeSep}>~</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 모바일 전용 액션 버튼 */}
          <div className={styles.mobileActions}>
            <button className={styles.btnSave} onClick={handleSave}>
              {saved ? '저장됨' : '저장하기'}
            </button>
            {status === 'ACTIVE' && (
              <button className={styles.btnTerminate} onClick={() => setStatus('INACTIVE')}>
                퇴직 처리
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
