'use client'

import { useRouter } from 'next/navigation'
import { LiaAngleLeftSolid } from 'react-icons/lia'
import { addRequest } from '@/mock/data'
import { useToast } from '@/context/ToastContext'
import { usePageLeave } from '@/lib/usePageLeave'
import RequestForm from '../RequestForm'
import styles from './page.module.css'

export default function NewOwnerRequestPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { leaving, leave, onAnimationEnd } = usePageLeave()

  return (
    <div
      className={`${styles.page} ${leaving ? styles.leaving : ''}`}
      onAnimationEnd={onAnimationEnd}
    >
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => leave(() => router.push('/owner/requests'))}
        >
          <LiaAngleLeftSolid /> 요청함
        </button>
      </header>

      <RequestForm
        showVisibility
        submitLabel="요청 등록"
        onCancel={() => router.push('/owner/requests')}
        onSubmit={({ type, content, visibility, fileCount }) => {
          addRequest({
            type,
            content,
            visibility,
            hasPhoto: fileCount > 0,
            employeeName: '사장',
          })
          showToast('요청이 등록되었습니다')
          router.push('/owner/requests')
        }}
      />
    </div>
  )
}
