'use client'

import { useRef, useState } from 'react'
import { LiaPaperclipSolid, LiaTimesSolid, LiaBarsSolid } from 'react-icons/lia'
import RichTextEditor from '@/components/RichTextEditor/RichTextEditor'
import SelectBox from '@/components/SelectBox'
import CategoryManagePopup from '@/components/CategoryManagePopup'
import CategoryColorPicker from '@/components/CategoryColorPicker'
import { REQUEST_CATEGORIES, mockRequests } from '@/mock/data'
import type { RequestCategory } from '@/mock/data'
import type { RequestVisibility } from '@/types'
import { useToast } from '@/context/ToastContext'
import { useConfirm } from '@/context/ConfirmContext'
import { useScrollLock } from '@/lib/useScrollLock'
import { usePopupEsc } from '@/lib/usePopupEsc'
import styles from './RequestForm.module.css'

// 에디터 HTML에 실제 내용(텍스트 또는 이미지)이 있는지
function hasEditorContent(html: string): boolean {
  return html.replace(/<[^>]+>/g, '').trim().length > 0 || html.includes('<img')
}

export default function RequestForm({
  initialType = REQUEST_CATEGORIES[0].name,
  initialContent = '',
  showVisibility = false,
  submitLabel = '요청 등록',
  onCancel,
  onSubmit,
}: {
  initialType?: string
  initialContent?: string
  showVisibility?: boolean
  submitLabel?: string
  onCancel: () => void
  onSubmit: (data: {
    type: string
    content: string
    visibility: RequestVisibility
    fileCount: number
  }) => void
}) {
  const [type, setType] = useState(initialType)
  const [visibility, setVisibility] = useState<RequestVisibility>('ALL')
  const [files, setFiles] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const contentRef = useRef(initialContent)
  const [hasContent, setHasContent] = useState(hasEditorContent(initialContent))
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 카테고리 관리 (요청 목록 페이지와 동일 패턴 — 로컬 상태)
  const { showToast } = useToast()
  const confirm = useConfirm()
  const [categories, setCategories] = useState<RequestCategory[]>(REQUEST_CATEGORIES)
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
    setCategories((prev) => [...prev, { id: `req-cat-${catSeqRef.current}`, name, color: catDraftColor }])
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
      if (cat && type === cat.name) setType(next[0]?.name ?? '')
      return next
    })
    showToast('카테고리가 삭제되었습니다')
  }

  function addFiles(list: FileList | null) {
    const names = Array.from(list ?? []).map((f) => f.name)
    if (names.length) setFiles((prev) => [...prev, ...names])
  }

  function submit() {
    if (!hasContent) return
    onSubmit({ type, content: contentRef.current, visibility, fileCount: files.length })
  }

  return (
    <div className={styles.form}>
      <div className={styles.fields}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>카테고리</span>
          <div className={styles.catRow}>
            <SelectBox
              value={type}
              onChange={setType}
              wrapClassName={styles.fieldControl}
              ariaLabel="카테고리 선택"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
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
        </div>

        {showVisibility && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>공개범위</span>
            <div className={styles.segmented}>
              <button
                type="button"
                className={`${styles.segBtn} ${visibility === 'ALL' ? styles.segBtnActive : ''}`}
                onClick={() => setVisibility('ALL')}
              >
                전체공개
              </button>
              <button
                type="button"
                className={`${styles.segBtn} ${visibility === 'OWNER_ONLY' ? styles.segBtnActive : ''}`}
                onClick={() => setVisibility('OWNER_ONLY')}
              >
                사장만
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.editorWrap}>
        <div className={styles.editorBox}>
          <RichTextEditor
            initialHtml={initialContent}
            placeholder="요청 내용을 입력하세요. 사진도 넣을 수 있어요."
            onChange={(html) => {
              contentRef.current = html
              setHasContent(hasEditorContent(html))
            }}
          />
        </div>
      </div>

      <div className={styles.attach}>
        <button
          type="button"
          className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            addFiles(e.dataTransfer.files)
          }}
        >
          <LiaPaperclipSolid />
          <span>파일을 끌어다 놓거나 클릭해서 첨부</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        {files.length > 0 && (
          <div className={styles.fileList}>
            {files.map((name, i) => (
              <div key={`${name}-${i}`} className={styles.fileItem}>
                <LiaPaperclipSolid className={styles.fileIcon} />
                <span className={styles.fileName}>{name}</span>
                <button
                  type="button"
                  className={styles.fileRemove}
                  onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                  aria-label={`${name} 제거`}
                >
                  <LiaTimesSolid />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.formFoot}>
        <button className={styles.btnCancel} onClick={onCancel}>
          취소
        </button>
        <button className={styles.btnCreate} onClick={submit} disabled={!hasContent}>
          {submitLabel}
        </button>
      </div>

      {catManageOpen && (
        <CategoryManagePopup
          categories={categories}
          getCount={(c) => mockRequests.filter((r) => r.type === c.name).length}
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
