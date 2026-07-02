'use client'

import { useRef, useState } from 'react'
import { LiaTrashAltSolid } from 'react-icons/lia'
import RichTextEditor from '@/components/RichTextEditor/RichTextEditor'
import { DOCUMENT_CATEGORIES } from '@/mock/documents'
import styles from './DocumentForm.module.css'

export default function DocumentForm({
  initialTitle = '',
  initialCategory = DOCUMENT_CATEGORIES[0].id,
  initialContent = '',
  submitLabel,
  onCancel,
  onSubmit,
  onDelete,
}: {
  initialTitle?: string
  initialCategory?: string
  initialContent?: string
  submitLabel: string
  onCancel: () => void
  onSubmit: (data: { title: string; category: string; content: string }) => void
  onDelete?: () => void
}) {
  const [title, setTitle] = useState(initialTitle)
  const [category, setCategory] = useState(initialCategory)
  const contentRef = useRef(initialContent)

  function submit() {
    const trimmed = title.trim()
    if (!trimmed) return
    onSubmit({ title: trimmed, category, content: contentRef.current })
  }

  return (
    <div className={styles.form}>
      <div className={styles.formHead}>
        <input
          className={styles.titleInput}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="문서 제목을 입력하세요"
          autoFocus
        />
        <select
          className={styles.select}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {DOCUMENT_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.editorWrap}>
        <RichTextEditor
          initialHtml={initialContent}
          placeholder="문서 내용을 작성하세요. 사진도 넣을 수 있어요."
          onChange={(html) => {
            contentRef.current = html
          }}
        />
      </div>
      <div className={styles.formFoot}>
        {onDelete && (
          <button className={styles.btnDanger} onClick={onDelete}>
            <LiaTrashAltSolid /> 삭제
          </button>
        )}
        <button className={styles.btnCancel} onClick={onCancel}>
          취소
        </button>
        <button className={styles.btnCreate} onClick={submit} disabled={!title.trim()}>
          {submitLabel}
        </button>
      </div>
    </div>
  )
}
