# Milestone 3.5 — Service Layer Hardening

**Agent:** Buffy  
**Date:** 2026-07-16  
**Repository:** `bigdrops-platform-office`  
**Status:** Complete ✅

---

## Summary

Established a shared domain types structure under `src/types/domain/`, removed all reverse dependencies from `src/lib/services/` to `src/app/`, and refactored both services and UI components to consume the same canonical type definitions.

---

## Files Created

| File | Purpose |
|------|---------|
| `src/types/domain/user-types.ts` | `UserRow`, `UserStatus`, `UserTeam`, `USER_TEAM_VALUES` |
| `src/types/domain/workspace-types.ts` | `WorkspaceStatusCounts`, `WorkspaceSummary` |
| `src/types/domain/incident-types.ts` | `IncidentSummary` |
| `src/types/domain/provisioning-types.ts` | `ProvisioningStatusCounts`, `FailedProvisioning` |

## Files Modified

| File | Change |
|------|--------|
| `src/lib/services/user-service.ts` | Changed import from `@/app/(main)/dashboard/users/_components/data` → `@/types/domain/user-types` |
| `src/lib/services/workspace-service.ts` | Removed local interface defs, imports from `@/types/domain/workspace-types` |
| `src/lib/services/incident-service.ts` | Removed local interface defs, imports from `@/types/domain/incident-types` |
| `src/lib/services/provisioning-service.ts` | Removed local interface defs, imports from `@/types/domain/provisioning-types` |
| `src/app/(main)/dashboard/users/_components/data.tsx` | Imports types from `@/types/domain/user-types`, removed re-export of types (now dead code) |
| `src/app/(main)/dashboard/users/_components/users.tsx` | Imports `UserRow` from `@/types/domain/user-types` directly |
| `src/app/(main)/dashboard/users/_components/users-columns.tsx` | Imports `UserRow` from `@/types/domain/user-types` directly |
| `src/app/(main)/dashboard/users/_components/users-table.tsx` | Imports `UserRow` from `@/types/domain/user-types` directly |

## Unchanged

| File | Why |
|------|-----|
| `src/lib/services/client.ts` | Remains minimal — only exports `getSupabase()`, no business logic |

---

## Dependency Changes

### Before
```
src/lib/services/user-service.ts
  → imports "UserRow" from @/app/(main)/dashboard/users/_components/data  ← REVERSE DEPENDENCY

src/lib/services/workspace-service.ts
  → defines WorkspaceStatusCounts, WorkspaceSummary locally

src/lib/services/incident-service.ts
  → defines IncidentSummary locally

src/lib/services/provisioning-service.ts
  → defines ProvisioningStatusCounts, FailedProvisioning locally
```

### After
```
src/lib/services/user-service.ts
  → imports "UserRow" from @/types/domain/user-types

src/lib/services/workspace-service.ts
  → imports "WorkspaceStatusCounts, WorkspaceSummary" from @/types/domain/workspace-types

src/lib/services/incident-service.ts
  → imports "IncidentSummary" from @/types/domain/incident-types

src/lib/services/provisioning-service.ts
  → imports "ProvisioningStatusCounts, FailedProvisioning" from @/types/domain/provisioning-types
```

All types now flow **outward** from the shared domain layer. No file under `src/lib/services/` imports from `src/app/`.

---

## Architectural Improvements

1. **Canonical Type Source**: Domain types live in one place (`src/types/domain/`) and are consumed by both services and UI components, preventing drift between service return types and UI consumption types.

2. **Clean Dependency Direction**: 
   ```
   src/types/domain/  ←  src/lib/services/  ←  src/app/
   ```
   Types flow left to right (services depend on types, UI depends on services).

3. **No Duplication**: Type interfaces that were previously copy-pasted in service files are now defined once in the shared domain layer.

4. **Minimal client.ts**: `client.ts` only exports the lazy `getSupabase()` accessor — no business logic, no types.

---

## Verification Results

### Build
```
✓ Compiled successfully
  ✓ TypeScript checked in 19.2s
  ✓ Static generation completed
  ✓ 24 routes
  ✓ 0 errors
```

### Lint
```
✗ 11 errors, 24 warnings (all pre-existing, in unrelated files)
  → No new errors introduced by our changes
```

### Constraint Check
```
grep -r "@/app/" src/lib/services/ --include="*.ts"
  → No matches found  ✅
```

### Git Status After
```
Modified (8):
  - src/lib/services/user-service.ts
  - src/lib/services/workspace-service.ts
  - src/lib/services/incident-service.ts
  - src/lib/services/provisioning-service.ts
  - src/app/(main)/dashboard/users/_components/data.tsx
  - src/app/(main)/dashboard/users/_components/users.tsx
  - src/app/(main)/dashboard/users/_components/users-columns.tsx
  - src/app/(main)/dashboard/users/_components/users-table.tsx

New (5):
  - src/types/domain/user-types.ts
  - src/types/domain/workspace-types.ts
  - src/types/domain/incident-types.ts
  - src/types/domain/provisioning-types.ts
```

---

## Recommended Next Milestone

**Milestone 4 — Lifecycle Orchestration Screen**

The service layer is now hardened with clean dependencies. The next step is implementing the `/dashboard/lifecycle` screen with:
1. Workspace approval queue display
2. Safe-action RPC integration (approve, suspend, archive)
3. Confirmation modals for destructive actions
4. Status transition workflows
