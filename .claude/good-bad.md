# Good / Bad

작업 전 반드시 확인한다.

---

## Good — 이렇게 해줘

- 시스템에서 사용되는 모든 삭제 버튼은 누르면 확인(컨펌) 창이 뜬 뒤 확인해야 실제 삭제한다. 공용 `useConfirm()`(`src/context/ConfirmContext.tsx`)을 사용한다.
- 모든 컨펌 창의 버튼 배치는 컨펌(확인/삭제) 버튼이 왼쪽, 취소 버튼이 오른쪽이다.
- 삭제·저장·추가 등 사용자 액션이 완료되면 토스트 메세지로 결과를 알린다. 공용 `useToast()`(`src/context/ToastContext.tsx`)를 사용한다.
- 무언가 작성하거나 설정하는(새로 만들기, 관리 등) 버튼은 기본적으로 화면 우측 하단 FAB(플로팅 버튼)에 둔다. `src/app/owner/checklists/page.module.css`의 `.fabWrap`/`.fab`/`.fabActive`/`.fabOverlay`/`.fabMenu`/`.fabMenuItem` 패턴과 위치(모바일: `right:16px; bottom: calc(var(--nav-height) + 16px)`, 태블릿+(`min-width:768px`): `right:28px; bottom:28px`)를 그대로 따른다. 옵션이 여러 개면 FAB 클릭 시 메뉴(`fabMenu`)를 펼치고, 옵션이 하나면 FAB 버튼 클릭이 바로 그 액션으로 이동한다.

---

## Bad — 하지 마

- 파일(md, tsx, css 등) 작성 시 이모지 사용 금지. AI스럽게 보인다.
