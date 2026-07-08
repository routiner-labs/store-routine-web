'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LiaAngleLeftSolid,
  LiaLockSolid,
  LiaUsersSolid,
  LiaPaperPlaneSolid,
  LiaExchangeAltSolid,
  LiaTrashAltSolid,
  LiaPencilAltSolid,
  LiaClipboardListSolid,
  LiaSearchSolid,
  LiaCheckSolid,
  LiaTimesSolid,
} from 'react-icons/lia'
import { mockRequests, mockReplies, mockActivityLogs, REQUEST_CATEGORIES } from '@/mock/data'
import { mockEmployees } from '@/mock/employees'
import { DEFAULT_CATEGORIES, registerTaskFromRequest, hasTaskForRequest, removeTasksForRequest } from '@/mock/tasks'
import type { TaskKind } from '@/mock/tasks'
import { DOCUMENT_CATALOG, DOCUMENT_CATEGORIES } from '@/mock/documents'
import DocumentDetailView from '@/app/owner/documents/DocumentDetailView'
import RichTextEditor from '@/components/RichTextEditor/RichTextEditor'
import { useToast } from '@/context/ToastContext'
import { useConfirm } from '@/context/ConfirmContext'
import type { RequestStatus, RequestType, RequestVisibility, RequestReply, ActivityLog } from '@/types'
import EmployeeProfilePopup from '@/components/EmployeeProfilePopup'
import EmployeeName from '@/components/EmployeeName'
import { useScrollLock } from '@/lib/useScrollLock'
import styles from './RequestDetailView.module.css'

const REQUEST_TYPES: RequestType[] = REQUEST_CATEGORIES.map((c) => c.name)

function typeTagClass(styles: Record<string, string>, type: string): string {
  return styles[`type_${type}`] ?? styles.type_default
}

const statusLabel: Record<string, string> = {
  REQUESTED: '미확인',
  CONFIRMED: '확인됨',
  IN_PROGRESS: '처리 중',
  DONE: '완료',
  REJECTED: '반려',
}

const statusActions: RequestStatus[] = ['CONFIRMED', 'IN_PROGRESS', 'DONE', 'REJECTED']

const TYPE_TO_TASK_CATEGORY: Record<string, string> = {
  재료부족: 'STOCK',
  청소시설: 'CLEAN',
  장비고장: 'SAFETY',
}

function activityText(log: ActivityLog): string {
  switch (log.type) {
    case 'CREATED':        return `${log.actorName}님이 요청을 작성했습니다`
    case 'STATUS_CHANGED': return `${log.actorName}님이 상태를 ${log.detail} 변경했습니다`
    case 'COMMENT_ADDED':  return `${log.actorName}님이 댓글을 달았습니다`
    case 'CONTENT_EDITED': return `${log.actorName}님이 내용을 수정했습니다`
    case 'TASK_ADDED':     return `${log.actorName}님이 업무리스트에 추가했습니다${log.detail ? ` (${log.detail})` : ''}`
    default: return ''
  }
}

export default function RequestDetailView({
  id,
  mode = 'page',
  onDeleted,
}: {
  id: string
  mode?: 'page' | 'modal'
  onDeleted?: () => void
}) {
  const router = useRouter()

  const request = mockRequests.find((r) => r.id === id)
  const [status, setStatus] = useState<RequestStatus>(request?.status ?? 'REQUESTED')
  const [type, setType] = useState<RequestType>(request?.type ?? '기타')
  const [visibility, setVisibility] = useState<RequestVisibility>(request?.visibility ?? 'ALL')
  const [replies, setReplies] = useState<RequestReply[]>(
    mockReplies.filter((r) => r.requestId === id)
  )
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(
    mockActivityLogs.filter((a) => a.requestId === id)
  )
  const [replyText, setReplyText] = useState('')
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null)
  const [editingReplyText, setEditingReplyText] = useState('')
  const [statusPopupOpen, setStatusPopupOpen] = useState(false)
  const [typePopupOpen, setTypePopupOpen] = useState(false)
  const [visibilityPopupOpen, setVisibilityPopupOpen] = useState(false)
  const [profilePopupOpen, setProfilePopupOpen] = useState(false)
  const [taskAddOpen, setTaskAddOpen] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskCategory, setTaskCategory] = useState('ETC')
  const [taskKind, setTaskKind] = useState<TaskKind>('EXTRA')
  const [taskDocRefs, setTaskDocRefs] = useState<string[]>([])
  const [taskAdded, setTaskAdded] = useState(() => hasTaskForRequest(id))
  const [taskDocPickerOpen, setTaskDocPickerOpen] = useState(false)
  const [taskDocQuery, setTaskDocQuery] = useState('')
  const [taskDocPreviewId, setTaskDocPreviewId] = useState<string | null>(null)
  const [taskMethodInitial, setTaskMethodInitial] = useState('')
  const taskMethodRef = useRef('')
  const { showToast } = useToast()
  const confirm = useConfirm()

  // 인라인 팝업(상태/유형/공개범위)이 열리면 뒤 페이지 스크롤 잠금
  useScrollLock(statusPopupOpen || typePopupOpen || visibilityPopupOpen || taskAddOpen || taskDocPickerOpen)

  const docTitle = (docId: string) => DOCUMENT_CATALOG.find((d) => d.id === docId)?.title ?? '삭제된 문서'
  const docCategoryName = (docId: string) => {
    const doc = DOCUMENT_CATALOG.find((d) => d.id === docId)
    return DOCUMENT_CATEGORIES.find((c) => c.id === doc?.category)?.name ?? '기타'
  }

  function toggleTaskDocRef(docId: string) {
    setTaskDocRefs((prev) =>
      prev.includes(docId) ? prev.filter((x) => x !== docId) : [...prev, docId],
    )
  }

  function filterTaskDocs(query: string) {
    const q = query.trim().toLowerCase()
    return DOCUMENT_CATALOG.filter((d) => !q || d.title.toLowerCase().includes(q))
  }

  function openTaskDocPicker() {
    setTaskDocQuery('')
    setTaskDocPreviewId(taskDocRefs[0] ?? DOCUMENT_CATALOG[0]?.id ?? null)
    setTaskDocPickerOpen(true)
  }

  if (!request) {
    return (
      <div className={styles.notFound}>
        <p>요청을 찾을 수 없습니다.</p>
        {mode === 'page' && (
          <button className={styles.backLink} onClick={() => router.back()}>목록으로</button>
        )}
      </div>
    )
  }

  const authorEmployee = mockEmployees.find((e) => e.name === request.employeeName)
  const [date, time] = request.createdAt.split(' ')
  const filteredTaskDocs = filterTaskDocs(taskDocQuery)

  function changeStatus(next: RequestStatus) {
    const prevLabel = statusLabel[status]
    const nextLabel = statusLabel[next]
    setStatus(next)
    setStatusPopupOpen(false)
    setActivityLogs((prev) => [...prev, {
      id: `a${Date.now()}`,
      requestId: id,
      type: 'STATUS_CHANGED',
      actorName: '사장',
      actorRole: 'OWNER',
      detail: `${prevLabel} → ${nextLabel}`,
      createdAt: '2026-06-30 방금',
    }])
    showToast(`상태가 "${nextLabel}"(으)로 변경되었습니다`)
  }

  function changeType(next: RequestType) {
    const prev = type
    setType(next)
    setTypePopupOpen(false)
    setActivityLogs((logs) => [...logs, {
      id: `a${Date.now()}`,
      requestId: id,
      type: 'CONTENT_EDITED',
      actorName: '사장',
      actorRole: 'OWNER',
      detail: `유형: ${prev} → ${next}`,
      createdAt: '2026-06-30 방금',
    }])
    showToast(`유형이 "${next}"(으)로 변경되었습니다`)
  }

  function changeVisibility(next: RequestVisibility) {
    const prevLabel = visibility === 'OWNER_ONLY' ? '사장만' : '전체공개'
    const nextLabel = next === 'OWNER_ONLY' ? '사장만' : '전체공개'
    setVisibility(next)
    setVisibilityPopupOpen(false)
    setActivityLogs((logs) => [...logs, {
      id: `a${Date.now()}`,
      requestId: id,
      type: 'CONTENT_EDITED',
      actorName: '사장',
      actorRole: 'OWNER',
      detail: `공개범위: ${prevLabel} → ${nextLabel}`,
      createdAt: '2026-06-30 방금',
    }])
    showToast(`공개범위가 "${nextLabel}"(으)로 변경되었습니다`)
  }

  async function deleteRequest() {
    const ok = await confirm({
      title: '요청을 삭제할까요?',
      message: taskAdded
        ? '이 요청과 관련 댓글, 활동 내역이 모두 삭제됩니다. 이 요청으로 만든 업무리스트 테스크도 함께 삭제됩니다.'
        : '이 요청과 관련 댓글, 활동 내역이 모두 삭제됩니다.',
    })
    if (!ok) return
    if (taskAdded) {
      removeTasksForRequest(id)
      showToast('요청과 업무리스트 테스크가 삭제되었습니다', 'error')
    } else {
      showToast('요청이 삭제되었습니다', 'error')
    }
    if (mode === 'modal') onDeleted?.()
    else router.back()
  }

  function openTaskAdd() {
    if (!request) return
    const base = request.content.replace(/\s+/g, ' ').trim()
    setTaskTitle(base.length > 24 ? `${base.slice(0, 24)}…` : base)
    setTaskCategory(TYPE_TO_TASK_CATEGORY[request.type] ?? 'ETC')
    setTaskKind('EXTRA')
    setTaskDocRefs([])
    const initialMethod = `<p>${request.content}</p>`
    taskMethodRef.current = initialMethod
    setTaskMethodInitial(initialMethod)
    setTaskAddOpen(true)
  }

  function confirmTaskAdd() {
    if (!request || !taskTitle.trim()) return
    registerTaskFromRequest({
      title: taskTitle.trim(),
      method: taskMethodRef.current,
      category: taskCategory,
      kind: taskKind,
      docRefs: taskDocRefs,
      requestRef: request.id,
    })
    setActivityLogs((logs) => [...logs, {
      id: `a${Date.now()}`,
      requestId: id,
      type: 'TASK_ADDED',
      actorName: '사장',
      actorRole: 'OWNER',
      detail: `${taskKind === 'COMMON' ? '공통' : '추가'} 업무`,
      createdAt: '2026-06-30 방금',
    }])
    setTaskAdded(true)
    setTaskAddOpen(false)
    showToast('테스크가 생성되어 오늘 업무리스트에 추가되었습니다')
  }

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
      authorName: '사장',
      authorRole: 'OWNER',
      createdAt: '2026-06-30 방금',
    }])
    setActivityLogs((prev) => [...prev, {
      id: `a${Date.now() + 1}`,
      requestId: id,
      type: 'COMMENT_ADDED',
      actorName: '사장',
      actorRole: 'OWNER',
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
    <div className={mode === 'modal' ? styles.viewModal : styles.page}>
      {mode === 'page' && (
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            <LiaAngleLeftSolid /> 요청함
          </button>
          <span className={styles.headerTitle}>{type}</span>
          <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
            {statusLabel[status]}
          </span>
        </header>
      )}

      <div className={styles.layout}>
        {/* 메인 패널: 본문 + 댓글 */}
        <div className={styles.mainPanel}>

          {/* 게시글 */}
          <article className={styles.post}>
            <div className={styles.postTopRow}>
              <span className={`${styles.typeTag} ${typeTagClass(styles, type)}`}>
                {type}
              </span>
              {visibility === 'OWNER_ONLY' ? (
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
                        <EmployeeName name={reply.authorName} className={styles.commentAuthor} />
                        {reply.authorRole === 'OWNER' && (
                          <span className={styles.ownerBadge}>사장</span>
                        )}
                        <span className={styles.commentTime}>{rDate} {rTime}</span>
                        {editingReplyId !== reply.id && (
                          <span className={styles.commentActions}>
                            {/* 수정은 사장 본인 댓글만, 삭제는 직원 댓글도 가능 */}
                            {reply.authorRole === 'OWNER' && (
                              <button
                                className={styles.commentActionBtn}
                                onClick={() => startEditReply(reply)}
                                aria-label="댓글 수정"
                              >
                                <LiaPencilAltSolid />
                              </button>
                            )}
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

        {/* 우측 패널 */}
        <aside className={styles.sidePanel}>
          {/* 요청 정보 */}
          <div className={styles.sideCard}>
            <p className={styles.sideCardTitle}>요청 정보</p>
            <div className={styles.metaList}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>요청자</span>
                <button
                  className={styles.metaAuthorBtn}
                  onClick={() => setProfilePopupOpen(true)}
                >
                  {request.employeeName}
                </button>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>일시</span>
                <span className={styles.metaValue}>{date} {time}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>공개</span>
                <span className={styles.metaValue}>
                  {visibility === 'OWNER_ONLY' ? '사장만' : '전체공개'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>사진</span>
                <span className={styles.metaValue}>{request.hasPhoto ? '있음' : '없음'}</span>
              </div>
            </div>
          </div>

          {/* 요청 관리 */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHeader}>
              <span className={styles.sideCardTitle}>요청 관리</span>
              <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
                {statusLabel[status]}
              </span>
            </div>
            <div className={styles.manageActions}>
              <button className={styles.manageBtn} onClick={() => setStatusPopupOpen(true)}>
                <LiaExchangeAltSolid /> 상태 변경
              </button>
              <button className={styles.manageBtn} onClick={() => setTypePopupOpen(true)}>
                <LiaPencilAltSolid /> 유형 변경
              </button>
              <button className={styles.manageBtn} onClick={() => setVisibilityPopupOpen(true)}>
                <LiaLockSolid /> 공개범위 변경
              </button>
              <button
                className={styles.manageBtn}
                onClick={openTaskAdd}
                disabled={taskAdded}
              >
                <LiaClipboardListSolid /> {taskAdded ? '업무리스트에 추가됨' : '업무리스트에 추가'}
              </button>
              <button
                className={`${styles.manageBtn} ${styles.manageBtnDanger}`}
                onClick={deleteRequest}
              >
                <LiaTrashAltSolid /> 요청 삭제
              </button>
            </div>
          </div>

          {/* 활동 히스토리 */}
          <div className={styles.sideCard}>
            <p className={styles.sideCardTitle}>활동 내역</p>
            <ul className={styles.timeline}>
              {[...activityLogs].reverse().map((log) => (
                <li key={log.id} className={styles.timelineItem}>
                  <span className={`${styles.timelineDot} ${styles[`dot_${log.type}`]}`} />
                  <div className={styles.timelineContent} data-tooltip={activityText(log)}>
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
            <p className={styles.popupCurrent}>현재: <strong>{statusLabel[status]}</strong></p>
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

      {/* 유형 변경 팝업 */}
      {typePopupOpen && (
        <div className={styles.popupOverlay} onClick={() => setTypePopupOpen(false)}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <span className={styles.popupTitle}>유형 변경</span>
              <button className={styles.popupClose} onClick={() => setTypePopupOpen(false)}>닫기</button>
            </div>
            <p className={styles.popupCurrent}>현재: <strong>{type}</strong></p>
            <div className={styles.popupOptions}>
              {REQUEST_TYPES.map((t) => (
                <button
                  key={t}
                  className={`${styles.popupOption} ${type === t ? styles.popupOptionTypeActive : ''}`}
                  onClick={() => changeType(t)}
                >
                  {t}
                  {type === t && <span className={styles.popupOptionCheck}>현재</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 공개범위 변경 팝업 */}
      {visibilityPopupOpen && (
        <div className={styles.popupOverlay} onClick={() => setVisibilityPopupOpen(false)}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <span className={styles.popupTitle}>공개범위 변경</span>
              <button className={styles.popupClose} onClick={() => setVisibilityPopupOpen(false)}>닫기</button>
            </div>
            <div className={styles.popupOptions} style={{ paddingTop: 16 }}>
              {(['ALL', 'OWNER_ONLY'] as const).map((v) => (
                <button
                  key={v}
                  className={`${styles.popupOption} ${visibility === v ? styles.popupOptionTypeActive : ''}`}
                  onClick={() => changeVisibility(v)}
                >
                  {v === 'ALL' ? '전체공개' : '사장만'}
                  {visibility === v && <span className={styles.popupOptionCheck}>현재</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 업무리스트에 추가 팝업 */}
      {taskAddOpen && (
        <div className={styles.popupOverlay} onClick={() => setTaskAddOpen(false)}>
          <div className={`${styles.popup} ${styles.popupWide}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <span className={styles.popupTitle}>업무리스트에 추가</span>
              <button className={styles.popupClose} onClick={() => setTaskAddOpen(false)}>닫기</button>
            </div>
            <div className={styles.taskAddBody}>
              <p className={styles.taskAddHint}>
                이 요청이 테스크에 참조로 연결됩니다. 수행 방법 팝업에서 원본 요청을 바로 열어볼 수 있습니다.
              </p>
              <label className={styles.taskAddField}>
                <span className={styles.taskAddLabel}>테스크 이름</span>
                <input
                  className={styles.taskAddInput}
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="테스크 이름을 입력하세요"
                />
              </label>
              <label className={styles.taskAddField}>
                <span className={styles.taskAddLabel}>카테고리</span>
                <select
                  className={styles.taskAddSelect}
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                >
                  {DEFAULT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <div className={styles.taskAddField}>
                <span className={styles.taskAddLabel}>추가할 리스트</span>
                <div className={styles.taskAddSeg}>
                  {(['COMMON', 'EXTRA'] as TaskKind[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      className={`${styles.taskAddSegBtn} ${taskKind === k ? styles.taskAddSegActive : ''}`}
                      onClick={() => setTaskKind(k)}
                    >
                      {k === 'COMMON' ? '공통 업무' : '추가 업무'}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.taskAddField}>
                <span className={styles.taskAddLabel}>수행 방법</span>
                <div className={styles.taskAddEditor}>
                  <RichTextEditor
                    key={request.id}
                    initialHtml={taskMethodInitial}
                    placeholder="이 업무의 수행 방법을 작성하세요."
                    onChange={(html) => {
                      taskMethodRef.current = html
                    }}
                  />
                </div>
              </div>
              <div className={styles.taskAddField}>
                <div className={styles.taskAddDocHead}>
                  <span className={styles.taskAddLabel}>참조 문서</span>
                  <button
                    type="button"
                    className={styles.taskAddDocBtn}
                    onClick={openTaskDocPicker}
                  >
                    문서 추가하기
                  </button>
                </div>
                {taskDocRefs.length === 0 ? (
                  <span className={styles.taskAddDocEmpty}>연결된 문서가 없습니다</span>
                ) : (
                  <div className={styles.taskAddDocList}>
                    {taskDocRefs.map((docId) => (
                      <div key={docId} className={styles.taskAddDocRow}>
                        <span className={styles.taskAddDocBadge}>{docCategoryName(docId)}</span>
                        <span className={styles.taskAddDocName}>{docTitle(docId)}</span>
                        <button
                          type="button"
                          className={styles.taskAddDocRemove}
                          onClick={() => toggleTaskDocRef(docId)}
                          aria-label="참조 해제"
                        >
                          <LiaTimesSolid />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                className={styles.taskAddSubmit}
                disabled={!taskTitle.trim()}
                onClick={confirmTaskAdd}
              >
                테스크 생성하고 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 참조 문서 선택 팝업: 좌측 검색+리스트 고정, 우측 문서 내용 뷰어 */}
      {taskDocPickerOpen && (
        <div className={styles.popupOverlay} onClick={() => { setTaskDocPickerOpen(false); setTaskDocQuery('') }}>
          <div className={`${styles.popup} ${styles.taskDocPopup}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <span className={styles.popupTitle}>참조 문서 선택</span>
              <button className={styles.popupClose} onClick={() => { setTaskDocPickerOpen(false); setTaskDocQuery('') }}>닫기</button>
            </div>
            <div className={styles.taskDocSplit}>
              <div className={styles.taskDocListPane}>
                <div className={styles.taskDocSearch}>
                  <LiaSearchSolid className={styles.taskDocSearchIcon} />
                  <input
                    className={styles.taskDocSearchInput}
                    type="text"
                    placeholder="문서 제목 검색"
                    value={taskDocQuery}
                    onChange={(e) => {
                      const q = e.target.value
                      setTaskDocQuery(q)
                      const filtered = filterTaskDocs(q)
                      if (!filtered.some((d) => d.id === taskDocPreviewId)) {
                        setTaskDocPreviewId(filtered[0]?.id ?? null)
                      }
                    }}
                  />
                </div>
                <div className={styles.taskDocList}>
                  {filteredTaskDocs.length === 0 ? (
                    <p className={styles.taskDocEmpty}>검색 결과가 없습니다.</p>
                  ) : (
                    filteredTaskDocs.map((d) => {
                      const on = taskDocRefs.includes(d.id)
                      const active = taskDocPreviewId === d.id
                      return (
                        <div
                          key={d.id}
                          className={`${styles.taskDocRow} ${active ? styles.taskDocRowActive : ''}`}
                        >
                          <button
                            type="button"
                            className={styles.taskDocRowMain}
                            onClick={() => setTaskDocPreviewId(d.id)}
                          >
                            <span className={styles.taskAddDocBadge}>{docCategoryName(d.id)}</span>
                            <span className={styles.taskAddDocName}>{d.title}</span>
                          </button>
                          <button
                            type="button"
                            className={`${styles.taskDocToggle} ${on ? styles.taskDocToggleActive : ''}`}
                            onClick={() => toggleTaskDocRef(d.id)}
                            aria-label={on ? '참조 해제' : '참조 추가'}
                          >
                            <LiaCheckSolid />
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
              <div className={styles.taskDocViewerPane}>
                {taskDocPreviewId ? (
                  <DocumentDetailView id={taskDocPreviewId} mode="modal" />
                ) : (
                  <p className={styles.taskDocViewerHint}>왼쪽에서 문서를 선택하면 내용을 볼 수 있습니다.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 직원 프로필 팝업 */}
      {profilePopupOpen && (
        <EmployeeProfilePopup
          name={request.employeeName}
          employee={authorEmployee}
          onClose={() => setProfilePopupOpen(false)}
        />
      )}
    </div>
  )
}
