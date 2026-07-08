import { mockChecklists } from '@/mock/data'
import ChecklistView from './ChecklistView'

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const checklist = mockChecklists.find((c) => c.id === id)

  if (!checklist) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        업무리스트를 찾을 수 없습니다.
      </div>
    )
  }

  return <ChecklistView checklist={checklist} />
}
