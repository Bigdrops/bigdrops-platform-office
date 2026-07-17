====================================================================
PRECONDITION

Read AGENTS.md before commencing this task. All applicable protocols and standards defined therein must be observed throughout this work.

====================================================================

The implementation plan has been revised following an architecture review.

Before making any code changes:

1. Read the updated implementation plan:
   docs/superpowers/plans/2026-07-17_lifecycle-orchestration.md

2. Read and apply the following skills from docs/ProjectSkillIndex.md:
   - karpathy-guidelines
   - next-best-practices
   - react-best-practices
   - shadcn
   - tailwind-css-patterns
   - supabase-postgres-best-practices
   - auth-implementation-patterns
   - audit-logging
   - typescript-advanced-types
   - ponytail

3. Update the implementation plan before beginning execution to incorporate the architectural revisions identified during review.

The required plan changes include:

- Remove all build verification steps (`bun run build`). AGENTS.md defines the verification policy.
- Replace `bunx tsc --noEmit` with `bun run typecheck` throughout the plan.
- Remove all git commit instructions. Implementation plans should not prescribe commit boundaries.
- Remove manual `mkdir` commands; directories should be created naturally when files are added.
- Replace `window.location.reload()` with Next.js App Router refresh (`router.refresh()`) to preserve SPA behavior.
- Ensure the lifecycle screen follows the project's Mobile-First policy by providing a responsive card layout on small screens rather than only a desktop table.
- Do not duplicate authorization or audit logging in the service layer if these responsibilities are already enforced by the approved lifecycle RPCs. The service layer should remain a thin RPC wrapper unless the PRD explicitly requires additional logic.
- Ensure only valid lifecycle transitions are exposed, matching the approved workspace state machine.
- Keep all database access inside `src/lib/services/`; UI components must never interact with Supabase directly.
- Preserve the existing service-layer architecture and avoid unnecessary abstractions or refactoring beyond the approved scope.

Once the implementation plan has been updated to reflect these revisions, execute it exactly as amended.