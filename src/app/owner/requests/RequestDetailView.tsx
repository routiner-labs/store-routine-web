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
  LiaReplySolid,
  LiaClipboardListSolid,
  LiaSearchSolid,
  LiaCheckSolid,
  LiaTimesSolid,
  LiaBookSolid,
  LiaFileAltSolid,
  LiaImageSolid,
  LiaDownloadSolid,
} from 'react-icons/lia'
import { mockRequests, mockReplies, mockActivityLogs, REQUEST_CATEGORIES } from '@/mock/data'
import { mockEmployees } from '@/mock/employees'
import { DEFAULT_CATEGORIES, registerTaskFromRequest, hasTaskForRequest, removeTasksForRequest } from '@/mock/tasks'
import type { TaskKind } from '@/mock/tasks'
import { DOCUMENT_CATALOG, DOCUMENT_CATEGORIES } from '@/mock/documents'
import RichTextEditor from '@/components/RichTextEditor/RichTextEditor'
import { useToast } from '@/context/ToastContext'
import { useConfirm } from '@/context/ConfirmContext'
import type { RequestStatus, RequestType, RequestVisibility, RequestReply, ActivityLog } from '@/types'
import EmployeeProfilePopup from '@/components/EmployeeProfilePopup'
import EmployeeName from '@/components/EmployeeName'
import SelectBox from '@/components/SelectBox'
import { useScrollLock } from '@/lib/useScrollLock'
import { usePopupEsc } from '@/lib/usePopupEsc'
import { categoryBadgeStyle } from '@/lib/categoryColors'
import { stripHtml, contentToHtml } from '@/lib/htmlText'
import styles from './RequestDetailView.module.css'

const REQUEST_TYPES: RequestType[] = REQUEST_CATEGORIES.map((c) => c.name)

function typeBadgeStyle(type: string) {
  return categoryBadgeStyle(REQUEST_CATEGORIES.find((c) => c.name === type)?.color)
}

// 에디터 HTML에 실제 내용이 있는지 (댓글 등록/저장 활성화 판단)
function hasHtmlContent(html: string): boolean {
  return stripHtml(html).length > 0 || /<img/i.test(html)
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
  // 하단 입력 에디터 하나로 새 댓글 / 답글(대댓글) / 수정을 모두 처리한다.
  // 내용은 ref로, 등록/저장 활성화는 hasContent로. initial은 수정 진입 시 기존 내용을 주입.
  const replyContentRef = useRef('')
  const [replyHasContent, setReplyHasContent] = useState(false)
  const [replyEditorKey, setReplyEditorKey] = useState(0) // 모드 전환/등록 시 remount 키
  const [composerInitial, setComposerInitial] = useState('') // 수정 시 기존 내용 프리필
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null) // 수정 대상 댓글 id
  const [replyingToId, setReplyingToId] = useState<string | null>(null) // 답글 대상 댓글 id(1뎁스)
  const commentInputRef = useRef<HTMLDivElement>(null)
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
  // 참조 문서 선택 초안 — '추가'를 눌러야 실제 반영 (업무리스트 문서 선택 팝업과 동일)
  const [taskDocDraftRefs, setTaskDocDraftRefs] = useState<string[]>([])
  const [taskMethodInitial, setTaskMethodInitial] = useState('')
  const taskMethodRef = useRef('')
  const { showToast } = useToast()
  const confirm = useConfirm()

  // 인라인 팝업(상태/유형/공개범위)이 열리면 뒤 페이지 스크롤 잠금
  useScrollLock(statusPopupOpen || typePopupOpen || visibilityPopupOpen || taskAddOpen || taskDocPickerOpen)

  // ESC 닫기(최상위 팝업만). 테스크 추가는 입력 폼이라 guard, 선택형 팝업은 viewer.
  usePopupEsc(taskAddOpen, 'guard', () => setTaskAddOpen(false))
  usePopupEsc(statusPopupOpen, 'viewer', () => setStatusPopupOpen(false))
  usePopupEsc(typePopupOpen, 'viewer', () => setTypePopupOpen(false))
  usePopupEsc(visibilityPopupOpen, 'viewer', () => setVisibilityPopupOpen(false))
  usePopupEsc(taskDocPickerOpen, 'guard', closeTaskDocPicker)

  const docTitle = (docId: string) => DOCUMENT_CATALOG.find((d) => d.id === docId)?.title ?? '삭제된 문서'
  const docCategoryName = (docId: string) => {
    const doc = DOCUMENT_CATALOG.find((d) => d.id === docId)
    return DOCUMENT_CATEGORIES.find((c) => c.id === doc?.category)?.name ?? '기타'
  }
  const docCategoryColor = (docId: string) => {
    const doc = DOCUMENT_CATALOG.find((d) => d.id === docId)
    return DOCUMENT_CATEGORIES.find((c) => c.id === doc?.category)?.color
  }

  function toggleTaskDocRef(docId: string) {
    setTaskDocRefs((prev) =>
      prev.includes(docId) ? prev.filter((x) => x !== docId) : [...prev, docId],
    )
  }

  function toggleTaskDocDraft(docId: string) {
    setTaskDocDraftRefs((prev) =>
      prev.includes(docId) ? prev.filter((x) => x !== docId) : [...prev, docId],
    )
  }

  function filterTaskDocs(query: string) {
    const q = query.trim().toLowerCase()
    return DOCUMENT_CATALOG.filter(
      (d) => !q || d.title.toLowerCase().includes(q) || docCategoryName(d.id).toLowerCase().includes(q),
    )
  }

  function openTaskDocPicker() {
    setTaskDocQuery('')
    setTaskDocDraftRefs(taskDocRefs)
    setTaskDocPreviewId(taskDocRefs[0] ?? DOCUMENT_CATALOG[0]?.id ?? null)
    setTaskDocPickerOpen(true)
  }

  function closeTaskDocPicker() {
    setTaskDocPickerOpen(false)
    setTaskDocQuery('')
  }

  function applyTaskDocPicker() {
    setTaskDocRefs(taskDocDraftRefs)
    closeTaskDocPicker()
    showToast(`참조 문서 ${taskDocDraftRefs.length}건이 적용되었습니다`)
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
  // 첨부파일 (목업: hasPhoto인 요청에 대표 첨부 표시)
  const attachments = request.hasPhoto
    ? [
        { name: '현장_사진.jpg', size: '1.4 MB' },
        { name: '참고자료.pdf', size: '320 KB' },
      ]
    : []

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
    const base = stripHtml(request.content)
    setTaskTitle(base.length > 24 ? `${base.slice(0, 24)}…` : base)
    setTaskCategory(TYPE_TO_TASK_CATEGORY[request.type] ?? 'ETC')
    setTaskKind('EXTRA')
    setTaskDocRefs([])
    const initialMethod = contentToHtml(request.content)
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

  // 하단 에디터를 특정 내용으로 새로 열기(remount) — 모드 전환 공통
  function loadComposer(html: string) {
    setComposerInitial(html)
    replyContentRef.current = html
    setReplyHasContent(hasHtmlContent(html))
    setReplyEditorKey((k) => k + 1)
    commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function startEditReply(reply: RequestReply) {
    setReplyingToId(null)
    setEditingReplyId(reply.id)
    loadComposer(contentToHtml(reply.content)) // 기존 내용을 하단 에디터에 프리필
  }

  function saveEditReply() {
    const html = replyContentRef.current
    if (!editingReplyId || !hasHtmlContent(html)) return
    setReplies((prev) => prev.map((r) => (r.id === editingReplyId ? { ...r, content: html } : r)))
    setEditingReplyId(null)
    loadComposer('') // 새 댓글 모드로 초기화
    showToast('댓글이 수정되었습니다')
  }

  // 수정/답글 모드 취소 → 새 댓글 모드로. 수정 취소 시엔 프리필 내용을 비운다.
  function cancelComposer() {
    if (editingReplyId) {
      setEditingReplyId(null)
      loadComposer('')
    } else {
      setReplyingToId(null)
    }
  }

  async function deleteReply(replyId: string) {
    const hasChildren = replies.some((r) => r.parentId === replyId)
    const ok = await confirm({
      title: '댓글을 삭제할까요?',
      message: hasChildren
        ? '이 댓글에 달린 답글도 함께 삭제됩니다.'
        : '삭제된 댓글은 되돌릴 수 없습니다.',
    })
    if (!ok) return
    // 부모 삭제 시 대댓글도 함께 제거(1뎁스)
    setReplies((prev) => prev.filter((r) => r.id !== replyId && r.parentId !== replyId))
    if (replyingToId === replyId) setReplyingToId(null)
    showToast('댓글이 삭제되었습니다', 'error')
  }

  function startReplyTo(commentId: string) {
    // 수정 모드에서 넘어오면 프리필 내용 비움. 새 댓글 초안은 유지.
    if (editingReplyId) {
      setEditingReplyId(null)
      loadComposer('')
    }
    setReplyingToId(commentId)
    // 하단 입력 에디터로 이동(별도 에디터를 띄우지 않고 재사용)
    commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function submitReply() {
    const html = replyContentRef.current
    if (!hasHtmlContent(html)) return
    const parentId = replyingToId // 답글 모드면 대상 댓글, 아니면 최상위 댓글
    setReplies((prev) => [...prev, {
      id: `r${Date.now()}`,
      requestId: id,
      ...(parentId ? { parentId } : {}),
      content: html,
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
    replyContentRef.current = ''
    setReplyHasContent(false)
    setReplyEditorKey((k) => k + 1) // 에디터 비우기(remount)
    setReplyingToId(null)
    showToast(parentId ? '답글이 등록되었습니다' : '댓글이 등록되었습니다')
  }

  // 댓글/대댓글 공통 렌더. isChild면 대댓글(답글 버튼 없음 — 중첩은 1뎁스까지).
  function renderCommentItem(reply: RequestReply, isChild: boolean) {
    const [rDate, rTime] = reply.createdAt.split(' ')
    const isEditing = editingReplyId === reply.id
    const isActiveTarget = isEditing || (!isChild && replyingToId === reply.id)
    return (
      <div
        key={reply.id}
        className={`${styles.comment} ${isChild ? styles.commentChild : ''} ${isActiveTarget ? styles.commentReplying : ''}`}
      >
        <div className={styles.commentAvatar}>{reply.authorName[0]}</div>
        <div className={styles.commentBody}>
          <div className={styles.commentHeader}>
            <EmployeeName name={reply.authorName} className={styles.commentAuthor} />
            {reply.authorRole === 'OWNER' && <span className={styles.ownerBadge}>사장</span>}
            <span className={styles.commentTime}>{rDate} {rTime}</span>
            {!isEditing && (
              <span className={styles.commentActions}>
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
          <div
            className={styles.commentContent}
            dangerouslySetInnerHTML={{ __html: contentToHtml(reply.content) }}
          />
          {isEditing ? (
            <span className={styles.editingHint}>아래 입력창에서 수정 중…</span>
          ) : (
            !isChild && (
              <button className={styles.replyToggle} onClick={() => startReplyTo(reply.id)}>
                <LiaReplySolid /> 답글
              </button>
            )
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={mode === 'modal' ? styles.viewModal : styles.page}>
      {mode === 'page' && (
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            <LiaAngleLeftSolid /> 요청함
          </button>
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
              <span className={styles.typeTag} style={typeBadgeStyle(type)}>
                {type}
              </span>
              {visibility === 'OWNER_ONLY' ? (
                <span className={styles.visibilityOwner}><LiaLockSolid /> 사장만</span>
              ) : (
                <span className={styles.visibilityAll}><LiaUsersSolid /> 전체공개</span>
              )}
            </div>
            <div
              className={styles.postContent}
              dangerouslySetInnerHTML={{ __html: contentToHtml(request.content) }}
            />
            {attachments.length > 0 && (
              <div className={styles.attachments}>
                <p className={styles.attachTitle}>첨부파일 {attachments.length}</p>
                <div className={styles.attachList}>
                  {attachments.map((f) => (
                    <div key={f.name} className={styles.attachItem}>
                      {/\.(jpg|jpeg|png|gif|webp)$/i.test(f.name) ? (
                        <LiaImageSolid className={styles.attachIcon} />
                      ) : (
                        <LiaFileAltSolid className={styles.attachIcon} />
                      )}
                      <span className={styles.attachName}>{f.name}</span>
                      <span className={styles.attachSize}>{f.size}</span>
                      <button className={styles.attachDownload} aria-label={`${f.name} 다운로드`}>
                        <LiaDownloadSolid />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* 댓글 */}
          <section className={styles.commentsSection}>
            <h2 className={styles.commentsTitle}>댓글 {replies.length}건</h2>

            {replies.length === 0 && (
              <p className={styles.emptyComments}>아직 댓글이 없습니다.</p>
            )}

            <div className={styles.commentList}>
              {replies
                .filter((reply) => !reply.parentId)
                .map((reply) => {
                  const children = replies.filter((r) => r.parentId === reply.id)
                  return (
                    <div key={reply.id} className={styles.commentThread}>
                      {renderCommentItem(reply, false)}
                      {children.length > 0 && (
                        <div className={styles.childArea}>
                          {children.map((child) => renderCommentItem(child, true))}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>

            <div className={styles.commentInputRow} ref={commentInputRef}>
              <div className={styles.commentInputAvatar}>사</div>
              <div className={styles.commentInputWrap}>
                {(editingReplyId || replyingToId) && (
                  <div className={styles.replyingBanner}>
                    {editingReplyId ? <LiaPencilAltSolid /> : <LiaReplySolid />}
                    <span>
                      {editingReplyId ? (
                        '댓글 수정 중'
                      ) : (
                        <>
                          <b>{replies.find((r) => r.id === replyingToId)?.authorName}</b>님에게 답글 남기는 중
                        </>
                      )}
                    </span>
                    <button
                      className={styles.replyingCancel}
                      onClick={cancelComposer}
                      aria-label="취소"
                    >
                      <LiaTimesSolid />
                    </button>
                  </div>
                )}
                <RichTextEditor
                  key={replyEditorKey}
                  initialHtml={composerInitial}
                  minHeight={110}
                  placeholder={
                    editingReplyId
                      ? '댓글을 수정하세요.'
                      : replyingToId
                        ? '답글을 입력하세요. 사진도 넣을 수 있어요.'
                        : '댓글을 입력하세요. 사진도 넣을 수 있어요.'
                  }
                  onChange={(html) => {
                    replyContentRef.current = html
                    setReplyHasContent(hasHtmlContent(html))
                  }}
                />
                <button
                  className={styles.commentSubmit}
                  onClick={editingReplyId ? saveEditReply : submitReply}
                  disabled={!replyHasContent}
                >
                  <LiaPaperPlaneSolid />{' '}
                  {editingReplyId ? '수정 완료' : replyingToId ? '답글 등록' : '등록'}
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
                <span className={styles.metaLabel}>첨부</span>
                <span className={styles.metaValue}>
                  {attachments.length > 0 ? `${attachments.length}개` : '없음'}
                </span>
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
        <div className={styles.popupOverlay}>
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
        <div className={styles.popupOverlay}>
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
        <div className={styles.popupOverlay}>
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
        <div className={styles.popupOverlay}>
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
                <SelectBox
                  value={taskCategory}
                  onChange={setTaskCategory}
                  wrapClassName={styles.taskAddSelectWrap}
                  ariaLabel="카테고리 선택"
                >
                  {DEFAULT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </SelectBox>
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

      {/* 참조 문서 선택 팝업 — 업무리스트(테스크 관리)의 문서 선택 팝업과 동일 디자인 */}
      {taskDocPickerOpen && (() => {
        const previewDoc = DOCUMENT_CATALOG.find((d) => d.id === taskDocPreviewId)
        return (
          <div className={styles.popupOverlay}>
            <div className={styles.docPickerCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.docPickerHead}>
                <span className={styles.docPickerHeadTitle}>참조 문서 선택</span>
                <button className={styles.docPickerClose} onClick={closeTaskDocPicker} aria-label="닫기">
                  <LiaTimesSolid />
                </button>
              </div>
              <div className={styles.docPickerBody}>
                {/* 좌: 목록 */}
                <div className={styles.docPickerListPane}>
                  <div className={styles.docPickerSearch}>
                    <LiaSearchSolid className={styles.docPickerSearchIcon} />
                    <input
                      className={styles.docPickerSearchInput}
                      type="text"
                      placeholder="이름·카테고리 검색"
                      value={taskDocQuery}
                      onChange={(e) => setTaskDocQuery(e.target.value)}
                    />
                    {taskDocQuery && (
                      <button
                        className={styles.docPickerSearchClear}
                        onClick={() => setTaskDocQuery('')}
                        aria-label="검색어 지우기"
                      >
                        <LiaTimesSolid />
                      </button>
                    )}
                  </div>
                  <div className={styles.docPickerList}>
                    {filteredTaskDocs.length === 0 ? (
                      <p className={styles.docPickerEmpty}>검색 결과가 없습니다</p>
                    ) : (
                      filteredTaskDocs.map((d) => {
                        const on = taskDocDraftRefs.includes(d.id)
                        const active = taskDocPreviewId === d.id
                        return (
                          <div
                            key={d.id}
                            className={`${styles.docPickerRow} ${active ? styles.docPickerRowActive : ''}`}
                          >
                            <button
                              type="button"
                              className={`${styles.docPickerCheck} ${on ? styles.docPickerCheckOn : ''}`}
                              onClick={() => toggleTaskDocDraft(d.id)}
                              aria-label={on ? `${d.title} 선택 해제` : `${d.title} 선택`}
                            >
                              {on && <LiaCheckSolid />}
                            </button>
                            <button
                              type="button"
                              className={styles.docPickerRowMain}
                              onClick={() => setTaskDocPreviewId(d.id)}
                            >
                              <span className={styles.docRefBadge}>{docCategoryName(d.id)}</span>
                              <span className={styles.docPickerRowName} title={d.title}>
                                {d.title}
                              </span>
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
                {/* 우: 뷰어 */}
                <div className={styles.docPickerViewer}>
                  {previewDoc ? (
                    <article>
                      <div className={styles.docPickerViewerHead}>
                        <span
                          className={styles.docPickerCatBadge}
                          style={categoryBadgeStyle(docCategoryColor(previewDoc.id))}
                        >
                          {docCategoryName(previewDoc.id)}
                        </span>
                        <h3 className={styles.docPickerViewerTitle}>{previewDoc.title}</h3>
                        <p className={styles.docPickerViewerMeta}>
                          <EmployeeName name={previewDoc.authorName} />
                          <span>
                            작성 {previewDoc.createdAt}
                            {previewDoc.updatedAt !== previewDoc.createdAt &&
                              ` · 수정 ${previewDoc.updatedAt}`}
                          </span>
                        </p>
                      </div>
                      <div
                        className={styles.docPickerViewerContent}
                        dangerouslySetInnerHTML={{ __html: previewDoc.content }}
                      />
                    </article>
                  ) : (
                    <div className={styles.docPickerViewerEmpty}>
                      <LiaBookSolid />
                      <p>왼쪽에서 문서를 선택하면 내용을 볼 수 있습니다</p>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.docPickerFoot}>
                <span className={styles.docPickerFootCount}>{taskDocDraftRefs.length}건 선택됨</span>
                <div className={styles.docPickerFootBtns}>
                  <button type="button" className={styles.docPickerBtnCancel} onClick={closeTaskDocPicker}>
                    취소
                  </button>
                  <button type="button" className={styles.docPickerBtnApply} onClick={applyTaskDocPicker}>
                    추가
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

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
