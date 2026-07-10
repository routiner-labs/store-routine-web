'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { LiaAngleLeftSolid } from 'react-icons/lia'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { REQUEST_CATEGORIES } from '@/mock/data'
import RequestForm from '@/app/owner/requests/RequestForm'
import styles from './page.module.css'

function NewRequestForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  // 홈 바로가기(?type=)에서 넘어온 유형을 미리 선택
  const initialType = searchParams.get('type')
  const validType = REQUEST_CATEGORIES.some((c) => c.name === initialType) ? initialType! : undefined

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/employee/requests" className={styles.backBtn}>
          <LiaAngleLeftSolid /> 요청함
        </Link>
      </header>

      <RequestForm
        initialType={validType}
        submitLabel="요청 등록"
        onCancel={() => router.push('/employee/requests')}
        onSubmit={() => {
          showToast('요청이 등록되었습니다')
          router.push('/employee/requests')
        }}
      />
    </div>
  )
}

export default function NewRequestPage() {
  return (
    <Suspense>
      <NewRequestForm />
    </Suspense>
  )
}
