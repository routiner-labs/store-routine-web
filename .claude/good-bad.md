# Good / Bad

작업 전 반드시 확인한다.

---

## Good — 이렇게 해줘

- 시스템에서 사용되는 모든 삭제 버튼은 누르면 확인(컨펌) 창이 뜬 뒤 확인해야 실제 삭제한다. 공용 `useConfirm()`(`src/context/ConfirmContext.tsx`)을 사용한다.
- 모든 컨펌 창의 버튼 배치는 컨펌(확인/삭제) 버튼이 왼쪽, 취소 버튼이 오른쪽이다.
- 삭제·저장·추가 등 사용자 액션이 완료되면 토스트 메세지로 결과를 알린다. 공용 `useToast()`(`src/context/ToastContext.tsx`)를 사용한다.

---

## Bad — 하지 마

- 파일(md, tsx, css 등) 작성 시 이모지 사용 금지. AI스럽게 보인다.
