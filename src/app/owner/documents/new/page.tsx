'use client'

import { useRouter } from 'next/navigation'
import { LiaAngleLeftSolid } from 'react-icons/lia'
import { useToast } from '@/context/ToastContext'
import { usePageLeave } from '@/lib/usePageLeave'
import DocumentForm from '../DocumentForm'
import styles from './page.module.css'

export default function NewDocumentPage() {
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
          onClick={() => leave(() => router.push('/owner/documents'))}
        >
          <LiaAngleLeftSolid /> 문서함
        </button>
      </header>

      <DocumentForm
        submitLabel="추가"
        onCancel={() => router.push('/owner/documents')}
        onSubmit={() => {
          showToast('문서가 추가되었습니다')
          router.push('/owner/documents')
        }}
      />
    </div>
  )
}
