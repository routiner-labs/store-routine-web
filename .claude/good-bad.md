# Good / Bad

작업 전 반드시 확인한다.

---

## Good — 이렇게 해줘

- 시스템에서 사용되는 모든 삭제 버튼은 누르면 확인(컨펌) 창이 뜬 뒤 확인해야 실제 삭제한다. 공용 `useConfirm()`(`src/context/ConfirmContext.tsx`)을 사용한다.
- 모든 컨펌 창의 버튼 배치는 컨펌(확인/삭제) 버튼이 왼쪽, 취소 버튼이 오른쪽이다.
- 삭제·저장·추가 등 사용자 액션이 완료되면 토스트 메세지로 결과를 알린다. 공용 `useToast()`(`src/context/ToastContext.tsx`)를 사용한다.
- 무언가 작성하거나 설정하는(새로 만들기, 관리 등) 버튼은 기본적으로 화면 우측 하단 FAB(플로팅 버튼)에 둔다. `src/app/owner/checklists/page.module.css`의 `.fabWrap`/`.fab`/`.fabActive`/`.fabOverlay`/`.fabMenu`/`.fabMenuItem` 패턴과 위치(모바일: `right:16px; bottom: calc(var(--nav-height) + 16px)`, 태블릿+(`min-width:768px`): `right:28px; bottom:28px`)를 그대로 따른다. 옵션이 여러 개면 FAB 클릭 시 메뉴(`fabMenu`)를 펼치고, 옵션이 하나면 FAB 버튼 클릭이 바로 그 액션으로 이동한다.
- 세부검색(고급 검색) 패널은 이제 표준 패턴이 정해졌다. 새로 만들거나 손댈 때 반드시 이 패턴을 따른다 — 상세는 `agents/design-agent.md`의 "세부검색(Advanced Search) 패턴" 섹션 참고.
  - 항목 순서: 내용 → 작성자 → 기간 → 카테고리 (그 뒤에 페이지 고유 필드, 예: 상태/공개범위).
  - N개 선택(카테고리·유형·상태 등)은 `src/components/MultiSelectFilter.tsx`를 재사용한다(체크박스 팝업 + 검색 + 적용 버튼 — 체크만으로 즉시 반영하지 않는다).
  - 기간은 `src/components/DateRangeFilter.tsx`를 재사용한다(시작일/종료일 입력 두 개가 아니라 달력 하나에서 클릭 두 번으로 범위 선택, 연월은 스크롤 다이얼로 선택).
  - 사람(작성자 등)은 텍스트 태그 입력(Enter로 추가/삭제) + `MultiSelectFilter` 팝업(버튼으로 열기)을 같은 배열에 병합하는 조합을 재사용한다 — `owner/documents`, `owner/requests`의 작성자 필드가 레퍼런스.
  - 같은 이름의 필드는 트리거 박스 폭을 통일한다(`.advSearchNarrow`, 현재 260px). 폭이 좁아 트리거 텍스트가 잘리면 전체 필드를 함께 늘린다.
  - 트리거의 X(선택 해제) 버튼은 항상 같은 자리(우측 고정 여백)에 절대위치로 띄워서, 있고 없고에 따라 박스 폭이 변하지 않게 한다.
  - 선택값이 있으면 트리거에 마우스 오버 시 요약 툴팁을 띄운다 — `src/lib/useHoverTooltip.ts` 재사용(`document.body`에 포털 렌더 + `position:fixed`로 `overflow:hidden` 부모에 잘리지 않음, 트리거~툴팁 사이 간격 없이 붙여서 마우스 이동 중 hover가 끊기지 않게 함).

---

## Bad — 하지 마

- 파일(md, tsx, css 등) 작성 시 이모지 사용 금지. AI스럽게 보인다.
- `setTimeout`을 쓰지 않는다. 타이밍 잡기 어렵다. 지연 후 화면 전환/상태 변경 대신 즉시 전환하고 토스트로 알리거나, 사용자가 버튼을 눌러 넘어가게 한다. (예외: 공용 ToastContext 내부의 자동 사라짐 타이머만 허용)
- 테스트용 dev 서버를 3000 포트로 띄우지 않는다. 사용자가 3000에서 실행 중이다. 검증 시 `PORT=3100 npm run dev`처럼 다른 포트를 쓴다.
