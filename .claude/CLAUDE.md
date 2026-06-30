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

processData ❌
allocateOutboundLocation ✅
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

These guidelines are working if:

Diffs become smaller and more intentional.
Unnecessary abstractions decrease.
Clarifying questions happen before implementation mistakes.
Existing business flows remain stable after changes.
Code becomes easier to review and maintain.