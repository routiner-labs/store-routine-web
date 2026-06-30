'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

const requestTypes = [
  { type: '재료부족', label: '재료 부족' },
  { type: '장비고장', label: '장비 고장' },
  { type: '근무변경', label: '근무 변경' },
  { type: '고객이슈', label: '고객 이슈' },
  { type: '청소시설', label: '청소/시설' },
  { type: '기타', label: '기타' },
]

export default function NewRequestPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [photoAttached, setPhotoAttached] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    if (!selectedType || !content.trim()) return
    setSubmitted(true)
    setTimeout(() => router.push('/employee'), 1500)
  }

  if (submitted) {
    return (
      <div className={styles.successPage}>
        <p className={styles.successText}>요청이 등록되었습니다</p>
        <p className={styles.successSub}>사장님에게 알림이 전송되었습니다</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/employee" className={styles.backBtn}>‹ 뒤로</Link>
        <h1 className={styles.title}>요청하기</h1>
      </header>

      <div className={styles.body}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>어떤 요청인가요?</h2>
          <div className={styles.typeGrid}>
            {requestTypes.map((item) => (
              <button
                key={item.type}
                className={`${styles.typeBtn} ${selectedType === item.type ? styles.typeSelected : ''}`}
                onClick={() => setSelectedType(item.type)}
              >
                <span className={styles.typeLabel}>{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>요청 내용</h2>
          <textarea
            className={styles.textarea}
            placeholder="사장님에게 전달할 내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
          />
        </section>

        <section className={styles.section}>
          <button
            className={`${styles.photoBtn} ${photoAttached ? styles.photoAttached : ''}`}
            onClick={() => setPhotoAttached(!photoAttached)}
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
