====================================================================
PRECONDITION

Read AGENTS.md before commencing this task. All applicable protocols and standards defined therein must be observed throughout this work.

====================================================================

## Objective

Complete the final architectural cleanup before Milestone 4 by eliminating the remaining dependency inversion. Establish a strict one-way dependency flow:

UI → Domain Types ← Services

After this task, `src/lib/services/` must be completely independent of `src/app/`.

## Scope

1. Audit `src/lib/services/` for any imports originating from `src/app/`.

2. Move all shared domain models currently defined under `src/app/` (starting with the Users module) into `src/types/domain/`.

3. Name domain type files by domain, for example:
   - `src/types/domain/user.ts`
   - `src/types/domain/workspace.ts`
   - `src/types/domain/incident.ts`
   - `src/types/domain/provisioning.ts`

   Only create files that are actually needed.

4. Update imports so that:
   - Services import only from `@/types/domain`.
   - UI imports shared models from `@/types/domain`.
   - UI-specific presentation types remain inside the UI layer.

## Constraints

- Do not change any business logic.
- Do not modify service behavior.
- Do not introduce new abstractions, factories, base classes, or dependency injection.
- Maintain the existing flat service architecture.
- `src/lib/services/` must never import from `src/app/`.
- `src/types/domain/` must not import from `src/app/`.
- Keep the implementation minimal and scoped.

## Verification

- Run `bun run typecheck`.
- Run `bun run build`.
- Confirm with `git status` that only the intended files were modified.

## Acceptance Criteria

- No imports from `src/app/` exist anywhere under `src/lib/services/`.
- Shared domain models live under `src/types/domain/`.
- Services and UI both consume the shared domain models.
- Runtime behavior remains unchanged.
- Typecheck and build complete successfully.