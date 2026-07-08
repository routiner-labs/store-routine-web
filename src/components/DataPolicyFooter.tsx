'use client'

import { useState } from 'react'
import Modal from '@/components/Modal'
import styles from './DataPolicyFooter.module.css'

const POLICY_SECTIONS: { title: string; items: string[] }[] = [
  {
    title: '저장 용량 산정',
    items: [
      '용량은 사진(업무 증빙)과 파일(문서함·요청 첨부)만 집계합니다. 체크리스트, 요청 내용 등 텍스트 데이터는 용량에 포함되지 않습니다.',
      '매장마다 기본 20GB가 제공되며, 추가 용량은 10GB 단위로 구매할 수 있습니다(구매한 매장에만 적용).',
    ],
  },
  {
    title: '용량 초과 시',
    items: [
      '사진·파일 업로드만 제한되며, 출퇴근 기록 등 나머지 기능은 정상 동작합니다.',
      '용량이 자동으로 결제되지 않습니다. 추가 용량은 사장님이 직접 구매한 경우에만 적용됩니다.',
    ],
  },
  {
    title: '미납 시 이용 제한',
    items: [
      '결제일(매월 25일)에 결제가 실패해도 해당 월 말일까지는 정상 이용이 유지됩니다.',
      '다음 달 1일부터 계정 전체가 조회 전용으로 전환됩니다. 직원 계정도 동일하게 출퇴근 기록·체크 등 쓰기 기능이 제한되며 조회만 가능합니다.',
      '14일까지 결제가 확인되지 않으면 로그인이 제한됩니다.',
    ],
  },
  {
    title: '데이터 보관과 삭제',
    items: [
      '해지, 미납으로 인한 이용 제한, 무료 체험 종료 후 미결제 시에도 데이터는 90일간 보관됩니다.',
      '90일이 지나면 데이터가 영구 삭제되며, 삭제 전에 별도로 안내드립니다.',
    ],
  },
]

// 프로필 페이지 하단 공통 푸터 — "데이터 처리 기준" 상시 고지 팝업
export default function DataPolicyFooter() {
  const [open, setOpen] = useState(false)

  return (
    <footer className={styles.footer}>
      <button className={styles.link} onClick={() => setOpen(true)}>
        데이터 처리 기준
      </button>

      {open && (
        <Modal title="데이터 처리 기준" onClose={() => setOpen(false)}>
          <div className={styles.policy}>
            {POLICY_SECTIONS.map((section) => (
              <div key={section.title} className={styles.section}>
                <span className={styles.sectionTitle}>{section.title}</span>
                <ul className={styles.list}>
                  {section.items.map((item, i) => (
                    <li key={i} className={styles.item}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </footer>
  )
}
