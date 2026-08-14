Behavioral guidelines to reduce common LLM coding mistakes.
Merge with project-specific instructions as needed.

## Agent System

작업 성격에 따라 `.claude/agents/` 폴더의 해당 에이전트 속성을 참고하여 작업한다.

| 에이전트 | 파일 | 담당 |
|---|---|---|
| Planning Agent | `agents/planning-agent.md` | 기능 범위 정의, 우선순위, 구현 순서 |
| Design Agent | `agents/design-agent.md` | UI/UX 설계, 화면 구조, 컴포넌트 계층 |
| Coding Agent | `agents/coding-agent.md` | 실제 코드 구현 |
| API Agent | `agents/api-agent.md` | 백엔드 API 계약 정의, 요청/응답 타입 |
| Security Agent | `agents/security-agent.md` | 인증, 권한 분리, 보안 취약점 검토 |
| Test Agent | `agents/test-agent.md` | 테스트 케이스 정의 및 작성 |
| Validation Agent | `agents/validation-agent.md` | 구현 결과 검증, 규칙 준수 확인 |
| Refactoring Agent | `agents/refactoring-agent.md` | 코드 품질 개선, 중복 제거, 구조 정리 |
| Performance Agent | `agents/performance-agent.md` | PWA 성능 최적화, 캐싱 전략 |
| SEO Agent | `agents/seo-agent.md` | 메타데이터, 시맨틱 HTML, PWA manifest |
| Documentation Agent | `agents/documentation-agent.md` | 컴포넌트 문서, API 문서, 온보딩 자료 |

### 작업 흐름

```
기능 요청
  → Planning Agent: 범위 및 순서 확인
  → Design Agent: UI/UX 설계
  → Coding Agent: 구현
  → Test Agent: 테스트
  → Validation Agent: 최종 검증
```

단순 버그 수정이나 소규모 변경은 Coding Agent → Validation Agent만 적용한다.

### 서브에이전트 위임 규칙

서브에이전트 사용은 사용자의 사전 승인이 필요하다. 이것은 하드 게이트다 — 이전에 "다 써도 됨" 같은 포괄적 승인을 받았더라도 매번 다시 확인한다.

위임이 필요해 보이면 먼저 멈추고, 어떤 에이전트를 어떤 작업에 왜 쓰려는지 설명한 뒤 사용자의 결정을 기다린다. 승인 후에만 실행한다. 사용자가 거절하면 직접 처리하거나 사용자가 지시하는 다른 방식을 따른다.

에이전트는 빈 컨텍스트로 시작해 이 CLAUDE.md와 전달받은 프롬프트만 가지고 작업한다. 그대로 두면 각 에이전트가 이미 확인된 내용을 다시 탐색하며 토큰을 낭비한다. 그래서 위임 전에 `.claude/context/<task-name>.md`에 공유 컨텍스트 문서를 만든다. 이미 확인된 사실만 담고, 각 사실에 파일:줄 번호나 확인에 쓴 명령어를 남긴다. 확인된 사실과 미확인 가정을 명확히 구분한다. 문서는 짧게 유지한다 — 모든 에이전트가 이걸 읽는 데 토큰을 쓴다.

서브에이전트를 사용한 작업은 끝난 뒤 `.claude/requests/<YYYY-MM-DD>/`에 보고서를 작성한다(아래 "MD 산출물 저장" 규칙에 따른 파일명 사용). 보고서에는 다음을 포함한다:
- 어떤 에이전트를 썼는지
- 왜 썼는지 — 구체적으로 무엇을 위임했고 왜 직접 하지 않았는지
- 비용 — 소비한 토큰, 툴콜 수, 소요 시간(실제 수치, 추정 금지)
- 산출물 — 실제 결과물을 충실히 요약(잘못되거나 놓친 부분 포함)
- 결과 반영 방식 — 그대로 채택 / 수정 후 채택(무엇을 고쳤는지) / 폐기(왜인지)

Tradeoff: These guidelines bias toward caution over speed.
For trivial tasks, use judgment.

1. Think Before Coding

Don't assume.
Don't hide confusion.
Surface tradeoffs.

Before implementing:

State your assumptions explicitly.
If uncertain, ask.
If multiple interpretations exist, present them instead of silently choosing one.
If a simpler approach exists, say so.
Push back when warranted.
If something is unclear, stop and explain what is unclear.
2. Simplicity First

Write the minimum code necessary to solve the problem.

No speculative features.
No abstractions for single-use code.
No configurability that was not requested.
Avoid speculative or defensive error handling for unsupported or unreachable states.
Prefer the simplest readable solution with the lowest necessary complexity.
If the implementation feels overengineered, simplify it.

Prefer domain-oriented naming over generic technical naming.

Use names that reflect business meaning.
Avoid vague names such as processData, handleItem, manager, helper, or util unless they genuinely represent their role.

Examples:

processData [Bad]
allocateOutboundLocation [Good]
3. Surgical Changes

Touch only what is required.

When editing existing code:

Do not refactor unrelated areas.
Do not improve adjacent code unless required by the task.
Match the existing style unless the existing pattern introduces bugs, security risks, or critical architectural violations.
Do not rename variables, methods, DTOs, files, or folders unless required by the task.
Remove only the unused code introduced by your own changes.
If unrelated dead code exists, mention it instead of deleting it.

Every changed line should directly trace back to the user's request.

4. Goal-Driven Execution

Define success criteria before implementation.

Transform vague tasks into verifiable goals.

Examples:

"Add validation"
→ "Write validation cases and verify invalid inputs fail correctly."
"Fix the bug"
→ "Reproduce the issue, fix it, and verify the reproduction no longer fails."
"Refactor X"
→ "Verify behavior remains identical before and after refactoring."

For multi-step tasks:

Define the step.
Define how it will be verified.
Repeat until complete.

Prefer automated verification where practical.
If automated testing is impractical, define reproducible manual verification steps.

5. Transaction and Data Safety

Preserve transactional integrity.

Do not split transactional flows unless explicitly requested.
Do not introduce partial-update risks in inventory, warehouse, or financial workflows.
Keep state transitions explicit and traceable.

Do not change:

database schema
column types
constraints
indexes
transactional boundaries

unless explicitly requested.

6. Scope Discipline

Do exactly what was requested.

Do not add unrelated improvements.
Do not introduce new architecture unless necessary.
Do not add future-proofing without a clear requirement.
Do not silently change behavior.
Do not optimize prematurely.

If a requested approach appears risky, explain the tradeoff before implementing.

7. Verification Mindset

Before finalizing:

Verify the requested behavior works.
Verify existing behavior was not unintentionally changed.
Verify imports, types, and references remain valid.
Verify no unnecessary files or code were modified.
Verify naming still reflects business intent.
Verify the implementation remains readable.

Strong verification is preferred over fast completion.

## Good / Bad

작업 전 `.claude/good-bad.md` 파일을 반드시 확인한다.

- **Good** 항목 — 해당 상황에서 적극적으로 적용한다.
- **Bad** 항목 — 어떤 상황에서도 하지 않는다.

사용자가 "싫다", "하지 마", "앞으로 이렇게 해줘" 등의 피드백을 주면 즉시 해당 파일에 추가한다.

추가할 때 항목 맨 앞에 실제 현재 시각(시스템에서 읽은 값, 추측 금지)을 남긴다. Append-only — 과거 항목은 절대 수정하거나 삭제하지 않는다. 항목이 더 이상 유효하지 않게 되면 그 위에 새 항목을 추가해 갱신 내용을 남긴다.

---

## Work History

모든 작업이 완료된 후 `history/` 폴더에 날짜별 MD 파일을 작성한다.

- 파일명: `.claude/history/YYYY-MM-DD.md`
- 같은 날 여러 작업이 있으면 같은 파일에 섹션을 추가한다.
- 기록 항목: 작업한 파일 목록, 변경 이유, 주요 결정 사항, 화면/기능 목록, 상태(완료 / 진행중 / 보류)
- 시각·날짜는 시스템에서 실제로 읽은 값을 쓴다(추측 금지).
- Append-only — 과거 항목은 수정하거나 삭제하지 않는다. 진행 중이던 작업을 이어서 할 때는 기존 항목을 고치지 말고 새 항목을 추가해 이전 항목을 참조한다.

작업 기록 없이 대화를 마치지 않는다.

---

## MD 산출물 저장

사용자가 보고서·분석·정리 문서를 md 파일로 요청하면(기획서 제외 — 기획서는 `.claude/planning/`에 둔다) `.claude/requests/<YYYY-MM-DD>/`에 저장한다. 프로젝트 루트나 코드 옆에 두지 않는다. `<YYYY-MM-DD>`는 실제 작업을 수행한 날짜(시스템에서 읽은 값)이며, 그날 폴더가 없으면 새로 만든다.

파일명은 완료 시각을 `HHMM_` 접두사로 붙인 뒤 설명적인 kebab-case 이름을 이어 붙인다:

```
.claude/requests/2026-07-14/0959_출근현황-리팩터링-검토.md
.claude/requests/2026-07-14/1329_다크모드-점검-리포트.md
```

`HHMM`은 파일이 실제로 완성된 시각(시스템에서 읽은 값, 추측 금지)이다. 나중에 배너를 추가하거나 오타를 고치는 등 파일을 다시 건드려도 최초 생성 시각을 유지한다 — mtime 기준으로 재부여하지 않는다(재부여하면 나중에 대체된 파일이 대체한 파일보다 먼저 정렬되는 문제가 생긴다).

대괄호, 공백, 콜론은 파일명에 쓰지 않는다(`HHMM_이름.md`만). Windows에서 콜론은 예약 문자라 일부 도구에서 파일이 안 보일 수 있고, 공백·대괄호는 스크립트에 전달할 때 따옴표 처리가 번거롭다.

같은 주제라도 기존 파일을 덮어쓰기보다 새 파일을 만드는 쪽을 기본으로 한다(히스토리/굿뱃 로그와 같은 append 지향).

---

## 채팅 답변은 짧게

채팅 응답은 짧게 유지한다. 사용자가 묻기 전에 배경 설명이나 근거부터 늘어놓지 않는다. 결과나 다음 행동을 먼저 짧게 말하고, 더 자세한 설명이 필요한지 물어본 뒤 필요하면 그때 풀어서 설명한다.

---

These guidelines are working if:

Diffs become smaller and more intentional.
Unnecessary abstractions decrease.
Clarifying questions happen before implementation mistakes.
Existing business flows remain stable after changes.
Code becomes easier to review and maintain.