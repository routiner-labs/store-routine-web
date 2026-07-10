'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LiaAngleLeftSolid, LiaPencilAltSolid, LiaTrashAltSolid } from 'react-icons/lia'
import { useToast } from '@/context/ToastContext'
import { useConfirm } from '@/context/ConfirmContext'
import { usePageLeave } from '@/lib/usePageLeave'
import { DOCUMENT_CATALOG, DOCUMENT_CATEGORIES } from '@/mock/documents'
import { categoryBadgeStyle } from '@/lib/categoryColors'
import DocumentForm from './DocumentForm'
import EmployeeName from '@/components/EmployeeName'
import styles from './DocumentDetailView.module.css'

const TODAY = '2026-07-02'

function categoryName(id: string): string {
  return DOCUMENT_CATEGORIES.find((c) => c.id === id)?.name ?? '기타'
}

function categoryColor(id: string): string | undefined {
  return DOCUMENT_CATEGORIES.find((c) => c.id === id)?.color
}

export default function DocumentDetailView({
  id,
  mode = 'page',
  onDeleted,
}: {
  id: string
  mode?: 'page' | 'modal'
  onDeleted?: () => void
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const confirm = useConfirm()
  const { leaving, leave, onAnimationEnd } = usePageLeave()

  const original = DOCUMENT_CATALOG.find((d) => d.id === id)
  const [doc, setDoc] = useState(original)
  const [editing, setEditing] = useState(false)

  if (!doc) {
    return (
      <div className={styles.notFound}>
        <p>문서를 찾을 수 없습니다.</p>
        {mode === 'page' && (
          <button className={styles.backLink} onClick={() => router.push('/owner/documents')}>
            목록으로
          </button>
        )}
      </div>
    )
  }

  async function deleteDoc() {
    const ok = await confirm({
      title: '문서를 삭제할까요?',
      message: `'${doc!.title}' 문서가 삭제됩니다.`,
    })
    if (!ok) return
    showToast('문서가 삭제되었습니다', 'error')
    if (mode === 'modal') onDeleted?.()
    else router.push('/owner/documents')
  }

  return (
    <div
      className={mode === 'modal' ? styles.viewModal : `${styles.page} ${leaving ? styles.leaving : ''}`}
      onAnimationEnd={mode === 'page' ? onAnimationEnd : undefined}
    >
      {mode === 'page' ? (
        <header className={styles.header}>
          <button
            className={styles.backBtn}
            onClick={() => leave(() => router.push('/owner/documents'))}
          >
            <LiaAngleLeftSolid /> 문서함
          </button>
          {!editing && (
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
      ) : (
        !editing && (
          <div className={styles.modalActionBar}>
            <button className={styles.iconBtn} onClick={() => setEditing(true)} aria-label="수정">
              <LiaPencilAltSolid />
            </button>
            <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={deleteDoc} aria-label="삭제">
              <LiaTrashAltSolid />
            </button>
          </div>
        )
      )}

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
        <div className={`${styles.body} appEnter`}>
          <article className={styles.docCard}>
            <div className={styles.docHead}>
              <span className={styles.catBadge} style={categoryBadgeStyle(categoryColor(doc.category))}>
                {categoryName(doc.category)}
              </span>
              <h2 className={styles.title}>{doc.title}</h2>
              <p className={styles.meta}>
                <EmployeeName name={doc.authorName} className={styles.authorName} />
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
