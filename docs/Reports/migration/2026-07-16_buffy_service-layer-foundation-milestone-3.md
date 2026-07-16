# Milestone 3 — Service Layer Foundation & First Operational Screen

**Agent:** Buffy  
**Date:** 2026-07-16  
**Repository:** `bigdrops-platform-office`  
**Status:** Complete ✅

---

## Summary

Established the canonical service-layer architecture for the Platform Office under `src/lib/services/`, refactored the existing users page to remove direct database access, and replaced the placeholder overview page with a functional Platform Overview screen.

---

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/services/client.ts` | Shared lazy supabase accessor — all services import from here |
| `src/lib/services/workspace-service.ts` | Workspace queries: status counts, pending workspaces |
| `src/lib/services/incident-service.ts` | Incident queries: active incidents with graceful empty state |
| `src/lib/services/provisioning-service.ts` | Provisioning queries: status counts, failed provisioning |
| `src/lib/services/user-service.ts` | User queries: workspace members and invitations (moved from UI) |

## Files Modified

| File | Change |
|------|--------|
| `src/app/(main)/dashboard/users/page.tsx` | Removed direct `import("@/lib/supabase")` call; now delegates to `getWorkspaceUsers()` from `user-service.ts` |
| `src/app/(main)/dashboard/overview/page.tsx` | Replaced placeholder with full Platform Overview async server component |
| `src/app/(main)/dashboard/users/_components/data.tsx` | Removed orphaned `users` array export (data now lives in `user-service.ts`) |

---

## Service Layer Architecture

```
src/lib/services/
├── client.ts              # Shared getSupabase() lazy accessor
├── workspace-service.ts   # getWorkspaceStatusCounts(), getPendingWorkspaces()
├── incident-service.ts    # getActiveIncidents()
├── provisioning-service.ts # getProvisioningStatusCounts(), getFailedProvisioning()
└── user-service.ts        # getWorkspaceUsers()
```

### Design Decisions

1. **Lazy Supabase Accessor (`client.ts`)**: Services use dynamic `import("@/lib/supabase")` instead of a static import. This prevents build failures when Supabase environment variables are not configured, and keeps service modules safe to import during static generation.

2. **Graceful Fallbacks**: Every service function wraps Supabase calls in try/catch blocks and returns empty/default values on failure. This means the application functions even when backend tables don't exist yet (e.g., `platform_incidents` is "not yet defined" per PRD section 10.2).

3. **No Abstract Base Classes**: Each service is a flat file exporting typed async functions. No interfaces with one implementation, no factories, no dependency injection. YAGNI.

4. **Service → UI Type Flow**: `user-service.ts` imports `UserRow` from the page component's `_components/data` module. This is a known architectural debt — types should ideally flow from service to UI. Deferred to a future refactor.

---

## Database Access Changes

### Before (Users Page)
```ts
// Directly queried Supabase inside page component
const { supabase } = await import("@/lib/supabase");
const { data: members } = await supabase
  .from("workspace_members")
  .select(`role, joined_at, user:user_id (...)`)
  .eq("workspace_id", id);
```

### After (Users Page)
```ts
// All database logic delegated to service layer
import { getWorkspaceUsers } from "@/lib/services/user-service";
const usersData = await getWorkspaceUsers(activeWorkspaceId);
```

The service layer is now the **only** code that imports or queries Supabase. UI components consume typed service functions only.

---

## Platform Overview Screen

The placeholder has been replaced with a functional async server component:

### Layout

```
Platform Overview
├── KPI Cards (responsive 4-column grid → 2-col → 1-col)
│   ├── Active Workspaces (count, total trend)
│   ├── Pending Approval (count, action flag)
│   ├── Failed Provisioning (count)
│   └── Provisioned (count)
├── Orchestration Monitor (2-column grid on desktop)
│   ├── Workspaces Awaiting Approval (list or empty state)
│   └── Failed Provisioning (list with error details or empty state)
└── Active Incidents (list with severity badges or unavailable state)
```

### Data Sources

| Widget | Service | Table | Graceful Fallback |
|--------|---------|-------|-------------------|
| Workspace KPIs | `workspace-service.ts` | `public.workspaces` | Zeros on failure |
| Provisioning KPIs | `provisioning-service.ts` | `public.entity_provisioning_status` | Zeros on failure |
| Pending Workspaces | `workspace-service.ts` | `public.workspaces` | Empty list on failure |
| Failed Provisioning | `provisioning-service.ts` | `public.entity_provisioning_status` | Empty list on failure |
| Active Incidents | `incident-service.ts` | `public.platform_incidents` | Empty + note that table may not exist |

---

## Mobile-First Integration

- **Responsive Grids**: KPI cards use `grid-cols-2 md:grid-cols-4` — 2 columns on mobile, 4 on desktop. Monitor sections use `grid-cols-1 lg:grid-cols-2`.
- **Touch Targets**: Card padding provides adequate >44px touch targets.
- **No Hover-Dependent Logic**: All interactions are click/tap-based.
- **Safe-Area Ready**: Inherits layout's safe-area padding via parent container.
- **Drawer/Hooks Available**: `use-mobile.ts` and `drawer.tsx` remain importable for future interactive surfaces that need dialog→bottom-sheet behavior.

---

## Dead Code Removed

- `getHighSeverityIncidents()` from `incident-service.ts` — exported but never called
- `countActiveWorkspaces()` from `workspace-service.ts` — exported but never called
- Orphaned `users` array from `_components/data.tsx` — no longer imported by any file after page refactor

---

## Verification Results

### Build
```
✓ Compiled successfully
  ✓ TypeScript checked in 19.5s
  ✓ Static generation completed in 1599ms
  ✓ 24 routes (7 static, 17 dynamic)
  ✓ 0 errors
```

### Lint
```
✗ 11 errors, 23 warnings (all pre-existing, in .claude/skills/valyu-best-practices/scripts/valyu.mjs)
  → No errors in any of our new or modified files
```

### Git Status After
```
Modified:
  - src/app/(main)/dashboard/overview/page.tsx
  - src/app/(main)/dashboard/users/page.tsx
  - src/app/(main)/dashboard/users/_components/data.tsx

New (untracked):
  - src/lib/services/
    - client.ts
    - workspace-service.ts
    - incident-service.ts
    - provisioning-service.ts
    - user-service.ts
```

---

## Architectural Decisions Log

| Decision | Rationale |
|----------|-----------|
| Lazy supabase accessor over static import | Prevents build failure when env vars missing; matches existing dynamic import pattern |
| Flat service functions over class-based services | YAGNI — no shared state to manage |
| Graceful empty defaults on all queries | Tables may not exist during development; app must function without backend |
| Duplicate `getSupabase()` extraction → shared `client.ts` | DRY — was identical in 4 files |
| `users` array moved from page component to service | Service now owns fallback data; page components should not carry data |
| Reverse dependency tolerated (service imports UI type) | Avoiding a types refactor that would touch 5+ additional files; flagged as known debt |

---

## Recommended Next Milestone

**Milestone 4 — The Lifecycle Orchestration Screen**

The next logical step is building `/dashboard/lifecycle` (Workspace Lifecycle Orchestration). This screen would:

1. Display workspace status summary (approval queue, active/suspended/archived counts)
2. Implement workflow transitions: approve, suspend, archive via safe-action RPCs
3. Use the `workspace-service.ts` foundation + new mutation services
4. Add destructive-action confirmation modals (already in `src/components/ui/alert-dialog.tsx`)
5. Require `public.platform_operators` role checks for mutation authorization

The provisioning and incident services can remain as-is until their dedicated screens are built in later milestones.
