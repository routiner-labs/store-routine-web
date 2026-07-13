import { createTasksForDate } from '@/mock/tasks'
import type { Checklist } from '@/types'
import ChecklistView from './ChecklistView'

const TODAY = '2026-06-30'
const ME_ID = 'emp2'

function plainText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const task = createTasksForDate(TODAY).find(
    (item) => item.catalogId === id && item.assigneeIds.includes(ME_ID)
  )

  if (!task) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        업무리스트를 찾을 수 없습니다.
      </div>
    )
  }

  const checklist: Checklist = {
    id: task.catalogId,
    title: task.title,
    type: 'SPECIAL',
    items: [
      {
        id: task.id,
        title: task.title,
        description: plainText(task.method),
        completionType: 'CHECK',
        status: task.done ? 'DONE' : 'PENDING',
      },
    ],
  }

  return <ChecklistView checklist={checklist} />
}
