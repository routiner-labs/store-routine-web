'use client'

import { useRef, useState } from 'react'
import { LiaTrashAltSolid, LiaBarsSolid } from 'react-icons/lia'
import RichTextEditor from '@/components/RichTextEditor/RichTextEditor'
import SelectBox from '@/components/SelectBox'
import CategoryManagePopup from '@/components/CategoryManagePopup'
import CategoryColorPicker from '@/components/CategoryColorPicker'
import { DOCUMENT_CATEGORIES, DOCUMENT_CATALOG } from '@/mock/documents'
import type { DocumentCategory } from '@/mock/documents'
import { useToast } from '@/context/ToastContext'
import { useConfirm } from '@/context/ConfirmContext'
import { useScrollLock } from '@/lib/useScrollLock'
import { usePopupEsc } from '@/lib/usePopupEsc'
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

  // 카테고리 관리 (요청 작성 폼과 동일 패턴 — 로컬 상태)
  const { showToast } = useToast()
  const confirm = useConfirm()
  const [categories, setCategories] = useState<DocumentCategory[]>(DOCUMENT_CATEGORIES)
  const [catManageOpen, setCatManageOpen] = useState(false)
  const [catDraft, setCatDraft] = useState('')
  const [catDraftColor, setCatDraftColor] = useState<string | undefined>(undefined)
  const [catColorPickingId, setCatColorPickingId] = useState<string | null>(null)
  const catSeqRef = useRef(0)

  useScrollLock(catManageOpen)
  usePopupEsc(catManageOpen, 'viewer', () => setCatManageOpen(false))

  function addCategory() {
    const name = catDraft.trim()
    if (!name) return
    catSeqRef.current += 1
    setCategories((prev) => [...prev, { id: `doc-cat-${catSeqRef.current}`, name, color: catDraftColor }])
    setCatDraft('')
    setCatDraftColor(undefined)
    showToast('카테고리가 추가되었습니다')
  }
  function renameCategory(id: string, name: string) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
  }
  function setCategoryColor(id: string, color: string) {
    if (id === 'NEW') {
      setCatDraftColor(color)
      return
    }
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, color } : c)))
  }
  async function deleteCategory(id: string) {
    const cat = categories.find((c) => c.id === id)
    const ok = await confirm({
      title: '카테고리를 삭제할까요?',
      message: `'${cat?.name ?? ''}' 카테고리가 삭제됩니다.`,
    })
    if (!ok) return
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id)
      if (category === id) setCategory(next[0]?.id ?? '')
      return next
    })
    showToast('카테고리가 삭제되었습니다')
  }

  function submit() {
    const trimmed = title.trim()
    if (!trimmed) return
    onSubmit({ title: trimmed, category, content: contentRef.current })
  }

  return (
    <div className={`${styles.form} appEnter`}>
      <div className={styles.formHead}>
        <div className={styles.catRow}>
          <SelectBox
            value={category}
            onChange={setCategory}
            wrapClassName={styles.catControl}
            ariaLabel="카테고리 선택"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectBox>
          <button
            type="button"
            className={styles.catManageBtn}
            onClick={() => setCatManageOpen(true)}
            aria-label="카테고리 관리"
          >
            <LiaBarsSolid />
          </button>
        </div>
        <input
          className={styles.titleInput}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="문서 제목을 입력하세요"
          autoFocus
        />
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

      {catManageOpen && (
        <CategoryManagePopup
          categories={categories}
          getCount={(c) => DOCUMENT_CATALOG.filter((d) => d.category === c.id).length}
          draftName={catDraft}
          onDraftNameChange={setCatDraft}
          draftColor={catDraftColor}
          onAdd={addCategory}
          onRename={renameCategory}
          onDelete={deleteCategory}
          onPickColor={setCatColorPickingId}
          onClose={() => setCatManageOpen(false)}
        />
      )}
      {catColorPickingId && (
        <CategoryColorPicker
          initialColor={
            catColorPickingId === 'NEW'
              ? catDraftColor
              : categories.find((c) => c.id === catColorPickingId)?.color
          }
          previewText={
            catColorPickingId === 'NEW'
              ? catDraft.trim() || '새 카테고리'
              : categories.find((c) => c.id === catColorPickingId)?.name ?? ''
          }
          onApply={(hex) => setCategoryColor(catColorPickingId, hex)}
          onClose={() => setCatColorPickingId(null)}
        />
      )}
    </div>
  )
}
