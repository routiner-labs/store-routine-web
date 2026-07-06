'use client'

import { useRouter } from 'next/navigation'
import { LiaAngleLeftSolid } from 'react-icons/lia'
import { useToast } from '@/context/ToastContext'
import DocumentForm from '@/app/owner/documents/DocumentForm'
import styles from './page.module.css'

export default function EmployeeNewDocumentPage() {
  const router = useRouter()
  const { showToast } = useToast()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/employee/documents')}>
          <LiaAngleLeftSolid /> 문서함
        </button>
      </header>

      <DocumentForm
        submitLabel="추가"
        onCancel={() => router.push('/employee/documents')}
        onSubmit={() => {
          showToast('문서가 추가되었습니다')
          router.push('/employee/documents')
        }}
      />
    </div>
  )
}
