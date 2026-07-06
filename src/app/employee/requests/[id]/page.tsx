'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LiaAngleLeftSolid, LiaLockSolid, LiaUsersSolid, LiaPaperPlaneSolid } from 'react-icons/lia'
import { mockRequests, mockReplies } from '@/mock/data'
import { useToast } from '@/context/ToastContext'
import type { RequestReply } from '@/types'
import styles from './page.module.css'

// 데모 직원 페르소나
const ME = '이지은'

const statusLabel: Record<string, string> = {
  REQUESTED: '미확인',
  CONFIRMED: '확인됨',
  IN_PROGRESS: '처리 중',
  DONE: '완료',
  REJECTED: '반려',
}

const statusHint: Record<string, string> = {
  REQUESTED: '사장님이 아직 확인하지 않았습니다.',
  CONFIRMED: '사장님이 요청을 확인했습니다.',
  IN_PROGRESS: '사장님이 처리하고 있습니다.',
  DONE: '처리가 완료되었습니다.',
  REJECTED: '요청이 반려되었습니다.',
}

export default function EmployeeRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { showToast } = useToast()

  const request = mockRequests.find((r) => r.id === id)
  const [replies, setReplies] = useState<RequestReply[]>(
    mockReplies.filter((r) => r.requestId === id)
  )
  const [replyText, setReplyText] = useState('')

  if (!request) {
    return (
      <div className={styles.notFound}>
        <p>요청을 찾을 수 없습니다.</p>
        <button className={styles.backLink} onClick={() => router.push('/employee/requests')}>
          목록으로
        </button>
      </div>
    )
  }

  const [date, time] = request.createdAt.split(' ')

  function submitReply() {
    const text = replyText.trim()
    if (!text) return
    setReplies((prev) => [...prev, {
      id: `r${Date.now()}`,
      requestId: id,
      content: text,
      authorName: ME,
      authorRole: 'EMPLOYEE',
      createdAt: '2026-06-30 방금',
    }])
    setReplyText('')
    showToast('댓글이 등록되었습니다')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitReply()
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/employee/requests')}>
          <LiaAngleLeftSolid /> 요청함
        </button>
        <span className={styles.headerTitle}>{request.type}</span>
        <span className={`${styles.statusBadge} ${styles[`status_${request.status}`]}`}>
          {statusLabel[request.status]}
        </span>
      </header>

      <div className={styles.body}>
        <div className={`${styles.statusHint} ${styles[`hint_${request.status}`]}`}>
          {statusHint[request.status]}
        </div>

        <article className={styles.post}>
          <div className={styles.postTopRow}>
            <span className={`${styles.typeTag} ${styles[`type_${request.type}`]}`}>
              {request.type}
            </span>
            {request.visibility === 'OWNER_ONLY' ? (
              <span className={styles.visibilityOwner}><LiaLockSolid /> 사장만</span>
            ) : (
              <span className={styles.visibilityAll}><LiaUsersSolid /> 전체공개</span>
            )}
            <span className={styles.postDate}>{date} {time}</span>
          </div>
          <p className={styles.postContent}>{request.content}</p>
          {request.hasPhoto && <div className={styles.photoPlaceholder}>사진 첨부됨</div>}
        </article>

        <section className={styles.commentsSection}>
          <h2 className={styles.commentsTitle}>댓글 {replies.length}건</h2>

          {replies.length === 0 && (
            <p className={styles.emptyComments}>아직 댓글이 없습니다.</p>
          )}

          <div className={styles.commentList}>
            {replies.map((reply) => {
              const [rDate, rTime] = reply.createdAt.split(' ')
              return (
                <div key={reply.id} className={styles.comment}>
                  <div className={styles.commentAvatar}>{reply.authorName[0]}</div>
                  <div className={styles.commentBody}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>{reply.authorName}</span>
                      {reply.authorRole === 'OWNER' && (
                        <span className={styles.ownerBadge}>사장</span>
                      )}
                      <span className={styles.commentTime}>{rDate} {rTime}</span>
                    </div>
                    <p className={styles.commentContent}>{reply.content}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className={styles.commentInputRow}>
            <div className={styles.commentInputAvatar}>{ME[0]}</div>
            <div className={styles.commentInputWrap}>
              <textarea
                className={styles.commentTextarea}
                placeholder="댓글 입력 (Enter 전송, Shift+Enter 줄바꿈)"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
              />
              <button
                className={styles.commentSubmit}
                onClick={submitReply}
                disabled={!replyText.trim()}
              >
                <LiaPaperPlaneSolid /> 등록
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
