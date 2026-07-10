'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LiaAngleLeftSolid, LiaLockSolid, LiaUsersSolid, LiaPaperPlaneSolid, LiaPencilAltSolid, LiaTrashAltSolid } from 'react-icons/lia'
import { mockRequests, mockReplies, REQUEST_CATEGORIES } from '@/mock/data'
import { categoryBadgeStyle } from '@/lib/categoryColors'
import { contentToHtml } from '@/lib/htmlText'
import { useToast } from '@/context/ToastContext'
import { useConfirm } from '@/context/ConfirmContext'
import EmployeeName from '@/components/EmployeeName'
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
  const confirm = useConfirm()

  const request = mockRequests.find((r) => r.id === id)
  const [replies, setReplies] = useState<RequestReply[]>(
    mockReplies.filter((r) => r.requestId === id)
  )
  const [replyText, setReplyText] = useState('')
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null)
  const [editingReplyText, setEditingReplyText] = useState('')

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

  function startEditReply(reply: RequestReply) {
    setEditingReplyId(reply.id)
    setEditingReplyText(reply.content)
  }

  function saveEditReply() {
    const text = editingReplyText.trim()
    if (!text || !editingReplyId) return
    setReplies((prev) => prev.map((r) => (r.id === editingReplyId ? { ...r, content: text } : r)))
    setEditingReplyId(null)
    setEditingReplyText('')
    showToast('댓글이 수정되었습니다')
  }

  async function deleteReply(replyId: string) {
    const ok = await confirm({
      title: '댓글을 삭제할까요?',
      message: '삭제된 댓글은 되돌릴 수 없습니다.',
    })
    if (!ok) return
    setReplies((prev) => prev.filter((r) => r.id !== replyId))
    showToast('댓글이 삭제되었습니다', 'error')
  }

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
            <span
              className={styles.typeTag}
              style={categoryBadgeStyle(REQUEST_CATEGORIES.find((c) => c.name === request.type)?.color)}
            >
              {request.type}
            </span>
            {request.visibility === 'OWNER_ONLY' ? (
              <span className={styles.visibilityOwner}><LiaLockSolid /> 사장만</span>
            ) : (
              <span className={styles.visibilityAll}><LiaUsersSolid /> 전체공개</span>
            )}
            <span className={styles.postDate}>{date} {time}</span>
          </div>
          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: contentToHtml(request.content) }}
          />
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
                      <EmployeeName name={reply.authorName} className={styles.commentAuthor} />
                      {reply.authorRole === 'OWNER' && (
                        <span className={styles.ownerBadge}>사장</span>
                      )}
                      <span className={styles.commentTime}>{rDate} {rTime}</span>
                      {reply.authorName === ME && editingReplyId !== reply.id && (
                        <span className={styles.commentActions}>
                          <button
                            className={styles.commentActionBtn}
                            onClick={() => startEditReply(reply)}
                            aria-label="댓글 수정"
                          >
                            <LiaPencilAltSolid />
                          </button>
                          <button
                            className={`${styles.commentActionBtn} ${styles.commentActionDanger}`}
                            onClick={() => deleteReply(reply.id)}
                            aria-label="댓글 삭제"
                          >
                            <LiaTrashAltSolid />
                          </button>
                        </span>
                      )}
                    </div>
                    {editingReplyId === reply.id ? (
                      <div className={styles.commentEditWrap}>
                        <textarea
                          className={styles.commentTextarea}
                          value={editingReplyText}
                          onChange={(e) => setEditingReplyText(e.target.value)}
                          rows={2}
                          autoFocus
                        />
                        <div className={styles.commentEditActions}>
                          <button
                            className={styles.commentEditSave}
                            onClick={saveEditReply}
                            disabled={!editingReplyText.trim()}
                          >
                            저장
                          </button>
                          <button
                            className={styles.commentEditCancel}
                            onClick={() => setEditingReplyId(null)}
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className={styles.commentContent}>{reply.content}</p>
                    )}
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
