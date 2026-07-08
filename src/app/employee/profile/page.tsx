'use client'

import { useState } from 'react'
import PasswordChangePopup from '@/components/PasswordChangePopup'
import DataPolicyFooter from '@/components/DataPolicyFooter'
import styles from '../../owner/profile/page.module.css'

const EMPLOYEE = {
  initial: '이',
  name: '이지은',
  phone: '010-2345-6789',
  joinedAt: '2025-05-15',
  store: '스타벅스 강남점',
}

export default function EmployeeProfilePage() {
  const [pwOpen, setPwOpen] = useState(false)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>프로필</h1>
      </header>

      <div className={styles.body}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>내 정보</span>
          </div>
          <div className={styles.profileRow}>
            <span className={styles.profileAvatar}>{EMPLOYEE.initial}</span>
            <div className={styles.profileText}>
              <span className={styles.profileName}>{EMPLOYEE.name}</span>
              <span className={styles.profileRole}>직원 계정</span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>연락처</span>
            <span className={styles.infoValue}>{EMPLOYEE.phone}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>소속 매장</span>
            <span className={styles.infoValue}>{EMPLOYEE.store}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>입사일</span>
            <span className={styles.infoValue}>{EMPLOYEE.joinedAt}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>비밀번호</span>
            <button className={styles.smallBtn} onClick={() => setPwOpen(true)}>
              변경
            </button>
          </div>
        </section>
      </div>

      <DataPolicyFooter />

      {pwOpen && <PasswordChangePopup onClose={() => setPwOpen(false)} />}
    </div>
  )
}
