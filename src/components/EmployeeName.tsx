'use client'

import { useState } from 'react'
import { mockEmployees } from '@/mock/employees'
import EmployeeProfilePopup from './EmployeeProfilePopup'
import styles from './EmployeeName.module.css'

/**
 * 직원 이름 표시 공통 컴포넌트.
 * 직원 목록에 있는 이름이면 클릭 시 프로필 팝업을 띄우고,
 * 아니면(사장, 가입 신청자 등) 일반 텍스트로 렌더링한다.
 * 행 전체가 버튼/링크인 곳에서도 쓸 수 있도록 span + stopPropagation을 사용한다.
 */
export default function EmployeeName({ name, className }: { name: string; className?: string }) {
  const [open, setOpen] = useState(false)
  const employee = mockEmployees.find((e) => e.name === name)

  if (!employee) return <span className={className}>{name}</span>

  function openPopup(e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault()
    e.stopPropagation()
    setOpen(true)
  }

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        className={`${styles.name} ${className ?? ''}`}
        onClick={openPopup}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') openPopup(e)
        }}
      >
        {name}
      </span>
      {open && (
        <EmployeeProfilePopup
          name={name}
          employee={employee}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
