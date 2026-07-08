'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LiaAngleLeftSolid, LiaPencilAltSolid, LiaTrashAltSolid } from 'react-icons/lia'
import { useToast } from '@/context/ToastContext'
import { useConfirm } from '@/context/ConfirmContext'
import { DOCUMENT_CATALOG, DOCUMENT_CATEGORIES } from '@/mock/documents'
import DocumentForm from '@/app/owner/documents/DocumentForm'
import EmployeeName from '@/components/EmployeeName'
import styles from './page.module.css'

// 데모 직원 페르소나
const ME = '이지은'
const TODAY = '2026-07-02'

function categoryName(id: string): string {
  return DOCUMENT_CATEGORIES.find((c) => c.id === id)?.name ?? '기타'
}

export default function EmployeeDocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { showToast } = useToast()
  const confirm = useConfirm()

  const original = DOCUMENT_CATALOG.find((d) => d.id === id)
  const [doc, setDoc] = useState(original)
  const [editing, setEditing] = useState(false)

  if (!doc) {
    return (
      <div className={styles.notFound}>
        <p>문서를 찾을 수 없습니다.</p>
        <button className={styles.backLink} onClick={() => router.push('/employee/documents')}>
          목록으로
        </button>
      </div>
    )
  }

  // 본인이 작성한 문서만 수정/삭제 가능
  const isMine = doc.authorName === ME

  async function deleteDoc() {
    const ok = await confirm({
      title: '문서를 삭제할까요?',
      message: `'${doc!.title}' 문서가 삭제됩니다.`,
    })
    if (!ok) return
    showToast('문서가 삭제되었습니다', 'error')
    router.push('/employee/documents')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/employee/documents')}>
          <LiaAngleLeftSolid /> 문서함
        </button>
        {isMine && !editing && (
          <div className={styles.headerActions}>
            <button className={styles.iconBtn} onClick={() => setEditing(true)} aria-label="수정">
              <LiaPencilAltSolid />
            </button>
            <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={deleteDoc} aria-label="삭제">
              <LiaTrashAltSolid />
            </button>
          </div>
        )}
      </header>

      {editing ? (
        <DocumentForm
          initialTitle={doc.title}
          initialCategory={doc.category}
          initialContent={doc.content}
          submitLabel="저장"
          onCancel={() => setEditing(false)}
          onDelete={deleteDoc}
          onSubmit={({ title, category, content }) => {
            setDoc({ ...doc, title, category, content, updatedAt: TODAY })
            setEditing(false)
            showToast('저장되었습니다')
          }}
        />
      ) : (
        <div className={styles.body}>
          <article className={styles.docCard}>
            <div className={styles.docHead}>
              <span className={`${styles.catBadge} ${styles[`cat_${doc.category}`]}`}>
                {categoryName(doc.category)}
              </span>
              <h2 className={styles.title}>{doc.title}</h2>
              <p className={styles.meta}>
                <EmployeeName name={doc.authorName} className={styles.authorName} />
                {isMine && <span className={styles.mineBadge}>내 문서</span>}
                <span className={styles.metaDates}>
                  작성 {doc.createdAt}
                  {doc.updatedAt !== doc.createdAt && ` · 수정 ${doc.updatedAt}`}
                </span>
              </p>
            </div>
            <div className={styles.docContent} dangerouslySetInnerHTML={{ __html: doc.content }} />
          </article>
        </div>
      )}
    </div>
  )
}
