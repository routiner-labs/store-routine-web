Behavioral guidelines to reduce common LLM coding mistakes.
Merge with project-specific instructions as needed.

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