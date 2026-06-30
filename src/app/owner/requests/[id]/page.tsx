'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LiaAngleLeftSolid,
  LiaLockSolid,
  LiaUsersSolid,
  LiaPaperPlaneSolid,
  LiaExchangeAltSolid,
} from 'react-icons/lia'
import { mockRequests, mockReplies, mockActivityLogs } from '@/mock/data'
import type { RequestStatus, RequestReply, ActivityLog } from '@/types'
import styles from './page.module.css'

const statusLabel: Record<string, string> = {
  REQUESTED: '미확인',
  CONFIRMED: '확인됨',
  IN_PROGRESS: '처리 중',
  DONE: '완료',
  REJECTED: '반려',
}

const statusActions: RequestStatus[] = ['CONFIRMED', 'IN_PROGRESS', 'DONE', 'REJECTED']

function activityText(log: ActivityLog): string {
  switch (log.type) {
    case 'CREATED':        return `${log.actorName}님이 요청을 작성했습니다`
    case 'STATUS_CHANGED': return `${log.actorName}님이 상태를 ${log.detail} 변경했습니다`
    case 'COMMENT_ADDED':  return `${log.actorName}님이 댓글을 달았습니다`
    case 'CONTENT_EDITED': return `${log.actorName}님이 내용을 수정했습니다`
    default: return ''
  }
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const request = mockRequests.find((r) => r.id === id)
  const [status, setStatus] = useState<RequestStatus>(request?.status ?? 'REQUESTED')
  const [replies, setReplies] = useState<RequestReply[]>(
    mockReplies.filter((r) => r.requestId === id)
  )
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(
    mockActivityLogs.filter((a) => a.requestId === id)
  )
  const [replyText, setReplyText] = useState('')
  const [statusPopupOpen, setStatusPopupOpen] = useState(false)

  if (!request) {
    return (
      <div className={styles.notFound}>
        <p>요청을 찾을 수 없습니다.</p>
        <button className={styles.backLink} onClick={() => router.back()}>목록으로</button>
      </div>
    )
  }

  const [date, time] = request.createdAt.split(' ')

  function changeStatus(next: RequestStatus) {
    const prev = statusLabel[status]
    const nextLabel = statusLabel[next]
    setStatus(next)
    setStatusPopupOpen(false)
    const log: ActivityLog = {
      id: `a${Date.now()}`,
      requestId: id,
      type: 'STATUS_CHANGED',
      actorName: '사장',
      actorRole: 'OWNER',
      detail: `${prev} → ${nextLabel}`,
      createdAt: '2026-06-30 방금',
    }
    setActivityLogs((prev) => [...prev, log])
  }

  function submitReply() {
    const text = replyText.trim()
    if (!text) return

    const newReply: RequestReply = {
      id: `r${Date.now()}`,
      requestId: id,
      content: text,
      authorName: '사장',
      authorRole: 'OWNER',
      createdAt: '2026-06-30 방금',
    }
    const newLog: ActivityLog = {
      id: `a${Date.now() + 1}`,
      requestId: id,
      type: 'COMMENT_ADDED',
      actorName: '사장',
      actorRole: 'OWNER',
      createdAt: '2026-06-30 방금',
    }
    setReplies((prev) => [...prev, newReply])
    setActivityLogs((prev) => [...prev, newLog])
    setReplyText('')
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
        <button className={styles.backBtn} onClick={() => router.back()}>
          <LiaAngleLeftSolid /> 요청함
        </button>
        <span className={styles.headerTitle}>{request.type}</span>
        <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
          {statusLabel[status]}
        </span>
      </header>

      <div className={styles.layout}>
        {/* 메인 패널: 본문 + 댓글 */}
        <div className={styles.mainPanel}>

          {/* 게시글 */}
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
            </div>
            <p className={styles.postContent}>{request.content}</p>
            {request.hasPhoto && (
              <div className={styles.photoPlaceholder}>사진 첨부됨</div>
            )}
          </article>

          {/* 댓글 */}
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
              <div className={styles.commentInputAvatar}>사</div>
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

        {/* 우측 패널: 상태변경 + 활동 히스토리 */}
        <aside className={styles.sidePanel}>
          {/* 상태 변경 */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHeader}>
              <span className={styles.sideCardTitle}>현재 상태</span>
              <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
                {statusLabel[status]}
              </span>
            </div>
            <button className={styles.changeStatusBtn} onClick={() => setStatusPopupOpen(true)}>
              <LiaExchangeAltSolid /> 상태 변경
            </button>
          </div>

          {/* 요청 정보 */}
          <div className={styles.sideCard}>
            <p className={styles.sideCardTitle}>요청 정보</p>
            <div className={styles.metaList}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>요청자</span>
                <span className={styles.metaValue}>{request.employeeName}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>일시</span>
                <span className={styles.metaValue}>{date} {time}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>공개</span>
                <span className={styles.metaValue}>
                  {request.visibility === 'OWNER_ONLY' ? '사장만' : '전체공개'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>사진</span>
                <span className={styles.metaValue}>{request.hasPhoto ? '있음' : '없음'}</span>
              </div>
            </div>
          </div>

          {/* 활동 히스토리 */}
          <div className={styles.sideCard}>
            <p className={styles.sideCardTitle}>활동 내역</p>
            <ul className={styles.timeline}>
              {[...activityLogs].reverse().map((log) => (
                <li key={log.id} className={styles.timelineItem}>
                  <span className={`${styles.timelineDot} ${styles[`dot_${log.type}`]}`} />
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineText}>{activityText(log)}</span>
                    <span className={styles.timelineTime}>{log.createdAt}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* 상태 변경 팝업 */}
      {statusPopupOpen && (
        <div className={styles.popupOverlay} onClick={() => setStatusPopupOpen(false)}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <span className={styles.popupTitle}>상태 변경</span>
              <button className={styles.popupClose} onClick={() => setStatusPopupOpen(false)}>닫기</button>
            </div>
            <p className={styles.popupCurrent}>
              현재: <strong>{statusLabel[status]}</strong>
            </p>
            <div className={styles.popupOptions}>
              {statusActions.map((s) => (
                <button
                  key={s}
                  className={`${styles.popupOption} ${status === s ? styles.popupOptionActive : ''} ${styles[`popupOption_${s}`]}`}
                  onClick={() => changeStatus(s)}
                >
                  {statusLabel[s]}
                  {status === s && <span className={styles.popupOptionCheck}>현재</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
