'use client'

import { useEscClose } from './useEscClose'
import { useConfirm } from '@/context/ConfirmContext'

/**
 * 팝업 ESC 닫기 공통 규칙.
 * - mode 'viewer' : 뷰어(상세·프로필·안내 등)는 ESC로 바로 닫힘
 * - mode 'guard'  : 수정·생성 팝업은 ESC 시 "닫을까요?" 컨펌 후 닫힘
 * 항상 최상위(가장 최근에 열린) 팝업 하나에만 적용된다.
 */
export function usePopupEsc(active: boolean, mode: 'viewer' | 'guard', onClose: () => void) {
  const confirm = useConfirm()
  useEscClose(active, async () => {
    if (mode === 'guard') {
      const ok = await confirm({
        title: '편집을 닫을까요?',
        message: '저장하지 않은 변경 사항은 사라집니다.',
        confirmText: '닫기',
        cancelText: '계속 편집',
        danger: true,
      })
      if (!ok) return
    }
    onClose()
  })
}
