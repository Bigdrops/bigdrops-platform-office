====================================================================
PRECONDITION

Read AGENTS.md before commencing this task. All applicable protocols and standards defined therein must be observed throughout this work.

====================================================================

## Objective

Implement Milestone 4: Workspace Lifecycle Orchestration by replacing the placeholder Lifecycle screen with a functional operator workflow built on the existing service layer.

## Scope

1. Extend `src/lib/services/workspace-service.ts` with lifecycle mutation wrappers for:
   - `approveWorkspace`
   - `suspendWorkspace`
   - `archiveWorkspace`

   Implement these using the approved Platform Office RPCs defined in AGENTS.md.

2. Replace `src/app/(main)/dashboard/lifecycle/page.tsx` with a responsive Lifecycle Orchestration screen that:
   - Lists workspaces and their current lifecycle state.
   - Displays only valid actions for each workspace.
   - Uses existing shadcn/ui components.
   - Uses `AlertDialog` for all destructive or state-changing actions.

3. Refresh the UI after successful lifecycle operations so the displayed workspace state remains current.

## Constraints

- Preserve the existing service-layer architecture.
- Do not access Supabase directly from the UI.
- Do not introduce new architectural patterns or unnecessary abstractions.
- Reuse existing UI components wherever possible.
- Maintain mobile-first behaviour.

## Verification

- Run `bun run typecheck`.
- Run `bun run build`.
- Confirm lifecycle operations execute through the approved RPCs.
- Confirm only valid lifecycle actions are presented for each workspace state.

## Acceptance Criteria

- The Lifecycle screen replaces the placeholder implementation.
- Workspace lifecycle operations execute through the service layer.
- State-changing actions require confirmation.
- Mobile and desktop layouts are fully functional.
- Build and typecheck complete successfully.