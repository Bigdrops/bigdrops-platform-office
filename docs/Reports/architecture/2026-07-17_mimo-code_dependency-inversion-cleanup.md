# Dependency Inversion Cleanup — Milestone 4 Pre-Work

**Agent:** MiMoCode
**Date:** 2026-07-17
**Task:** Eliminate remaining dependency inversion in `src/lib/services/`

---

## Summary

Completed the final architectural cleanup before Milestone 4 by removing duplicate type files and standardizing all imports. The strict one-way dependency flow **UI → Domain Types ← Services** is now enforced.

---

## Audit Findings

### Services Layer (`src/lib/services/`)

All 4 service files already imported from `@/types/domain/*` — zero imports from `src/app/`:

| File | Import Source | Status |
|------|--------------|--------|
| `user-service.ts` | `@/types/domain/user-types` | Updated to `user` |
| `workspace-service.ts` | `@/types/domain/workspace-types` | Updated to `workspace` |
| `incident-service.ts` | `@/types/domain/incident-types` | Updated to `incident` |
| `provisioning-service.ts` | `@/types/domain/provisioning-types` | Updated to `provisioning` |
| `client.ts` | `@/lib/supabase` | No change needed |

### Domain Types (`src/types/domain/`)

4 duplicate `*-types.ts` files existed alongside canonical `.ts` files. Both sets contained identical type definitions:

- `user-types.ts` = `user.ts` (UserStatus, UserTeam, UserRow)
- `workspace-types.ts` = `workspace.ts` (WorkspaceStatusCounts, WorkspaceSummary)
- `incident-types.ts` = `incident.ts` (IncidentSummary)
- `provisioning-types.ts` = `provisioning.ts` (ProvisioningStatusCounts, FailedProvisioning)

### UI Layer (`src/app/`)

Types exported from `src/app/` are UI-specific and not shared with services:
- `InfrastructureEnvironment`, `InfrastructureGroup` — infrastructure dashboard only
- `RecentCustomerRow` — recent customers table only
- `ProposalSectionsRow` — legacy proposal sections table only
- `RecentLeadRow` — legacy recent leads table only

These correctly remain in the UI layer.

---

## Changes Made

### Deleted (4 files)

- `src/types/domain/user-types.ts`
- `src/types/domain/workspace-types.ts`
- `src/types/domain/incident-types.ts`
- `src/types/domain/provisioning-types.ts`

### Modified — Services (4 files)

Updated import paths from `*-types` to canonical `.ts`:

```
src/lib/services/user-service.ts       : user-types → user
src/lib/services/workspace-service.ts  : workspace-types → workspace
src/lib/services/incident-service.ts   : incident-types → incident
src/lib/services/provisioning-service.ts: provisioning-types → provisioning
```

### Modified — UI (4 files)

Updated import paths from `*-types` to canonical `.ts`:

```
src/app/(main)/dashboard/users/_components/data.tsx         : user-types → user
src/app/(main)/dashboard/users/_components/users-columns.tsx: user-types → user
src/app/(main)/dashboard/users/_components/users-table.tsx  : user-types → user
src/app/(main)/dashboard/users/_components/users.tsx        : user-types → user
```

---

## Verification

| Check | Result |
|-------|--------|
| `tsc --noEmit` | Passed — no type errors |
| `bun run build` | Passed — 25 routes compiled |
| No remaining `*-types` references | Confirmed via ripgrep |
| Services import only from `@/types/domain/*` | Confirmed |
| `src/types/domain/` has no imports from `src/app/` | Confirmed |

---

## Final Directory Structure

```
src/types/domain/
├── incident.ts      # IncidentSummary
├── provisioning.ts  # ProvisioningStatusCounts, FailedProvisioning
├── user.ts          # UserStatus, USER_TEAM_VALUES, UserTeam, UserRow
└── workspace.ts     # WorkspaceStatusCounts, WorkspaceSummary
```

---

## Acceptance Criteria

- [x] No imports from `src/app/` exist anywhere under `src/lib/services/`
- [x] Shared domain models live under `src/types/domain/`
- [x] Services and UI both consume the shared domain models
- [x] Runtime behavior remains unchanged
- [x] Typecheck and build complete successfully

---

## Git Status

**Before:** 0 uncommitted changes
**After:** 12 modified/deleted files, 4 untracked (new canonical `.ts` files)

All changes are scoped to type imports and file deletions — no business logic modified.
