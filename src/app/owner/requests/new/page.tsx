'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LiaAngleLeftSolid } from 'react-icons/lia'
import { addRequest, REQUEST_CATEGORIES } from '@/mock/data'
import { useToast } from '@/context/ToastContext'
import type { RequestVisibility } from '@/types'
import styles from './page.module.css'

export default function NewOwnerRequestPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState<RequestVisibility>('ALL')
  const [photoAttached, setPhotoAttached] = useState(false)

  function handleSubmit() {
    if (!selectedType || !content.trim()) return
    addRequest({
      type: selectedType,
      content: content.trim(),
      visibility,
      hasPhoto: photoAttached,
      employeeName: '사장',
    })
    showToast('요청이 등록되었습니다')
    router.push('/owner/requests')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/owner/requests')}>
          <LiaAngleLeftSolid /> 요청함
        </button>
      </header>

      <div className={styles.body}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>카테고리</h2>
          <div className={styles.typeGrid}>
            {REQUEST_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`${styles.typeBtn} ${selectedType === c.name ? styles.typeSelected : ''}`}
                onClick={() => setSelectedType(c.name)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>내용</h2>
          <textarea
            className={styles.textarea}
            placeholder="요청함에 남길 내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>공개범위</h2>
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
          <span className={styles.fieldHint}>
            {visibility === 'ALL' ? '전체 직원이 볼 수 있습니다.' : '사장만 볼 수 있습니다.'}
          </span>
        </section>

        <section className={styles.section}>
          <button
            type="button"
            className={`${styles.photoBtn} ${photoAttached ? styles.photoAttached : ''}`}
            onClick={() => setPhotoAttached((v) => !v)}
          >
            {photoAttached ? '사진 첨부됨 (취소)' : '사진 첨부 (선택)'}
          </button>
        </section>

        <div className={styles.footer}>
          <button
            className={styles.submitBtn}
            disabled={!selectedType || !content.trim()}
            onClick={handleSubmit}
          >
            요청 등록하기
          </button>
        </div>
      </div>
    </div>
  )
}
