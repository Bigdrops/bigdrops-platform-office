# Report: Platform Office Migration Roadmap

**Agent:** GitHub Copilot (MAI-Code-1-Flash)  
**Date:** 2026-07-15  
**Task Type:** Migration  
**Domain:** migration

---

## 1. Executive Summary

This report translates the repository audit into a concrete migration roadmap for the BIGDROPS Platform Office. The current codebase has strong foundation assets for shell, theming, and UI primitives, but it still reflects an admin-template starter in navigation, dependency footprint, and data-access patterns; the migration should therefore focus on decommissioning template-era routes, enforcing the public-schema service boundary, and adapting the existing shell for mobile-first operator workflows.

---

## 2. Task Scope

This work reviewed the current repository against the Platform Office PRD, the Multi-Tenancy PRD, and the repository guardrails in AGENTS.md. The scope was limited to analysis and documentation; no application source files or dependency manifests were modified.

---

## 3. Methodology

The migration plan was grounded in direct repository inspection and the documented product boundaries:

- Reviewed the Platform Office PRD and Multi-Tenancy PRD for architectural constraints, isolation rules, and mobile-first requirements.
- Reviewed AGENTS.md for the mandatory migration and reporting guardrails.
- Inspected the live repository structure and key files that govern navigation, mobile behavior, shell layout, and data access.
- Used the findings to produce a phased implementation roadmap that is compatible with the existing Next.js/App Router foundation.

---

## 4. Findings / Observations

### 4.1 Navigation still reflects a generic admin dashboard starter

The sidebar configuration in [src/navigation/sidebar/sidebar-items.ts](src/navigation/sidebar/sidebar-items.ts) still exposes template-era entries such as CRM, Finance, Analytics, Infrastructure, Tasks, Invoice, Users, Roles, and a Legacy section. That does not align with the Platform Office domains defined in the PRD, which are centered on platform operations rather than generic CRUD administration.

**Impact:** The shell still presents the wrong mental model to operators and would need a decommissioning pass before the platform console can be considered migration-ready.

### 4.2 The repository still has a direct route-level data access pattern that violates the service boundary

The page in [src/app/(main)/dashboard/users/page.tsx](src/app/(main)/dashboard/users/page.tsx) imports the Supabase client directly and queries workspace-related tables from a page component. This is the opposite of the required architecture, which mandates that rendering layers must not import or query the database directly.

**Impact:** This is the most important technical migration blocker because it violates the “No-Cross” and service-layer rules from the PRD and AGENTS.md.

### 4.3 The shell already contains reusable mobile and drawer primitives, but they are not yet being applied to operator workflows

The repository already includes a mobile hook in [src/hooks/use-mobile.ts](src/hooks/use-mobile.ts), a drawer wrapper in [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx), and a dashboard shell layout in [src/app/(main)/dashboard/layout.tsx](src/app/(main)/dashboard/layout.tsx). These are strong reusable assets for the mobile-first requirement.

**Impact:** The migration should reuse these primitives rather than introducing a new UI stack; the missing work is integration and policy enforcement for destructive workflows and safe-area support.

### 4.4 The current Supabase client entry point is a singleton, but it is not yet organized as a service boundary

The current Supabase client in [src/lib/supabase.ts](src/lib/supabase.ts) is a direct singleton export. That makes it easy to import from pages and components, which is exactly the pattern that needs to be removed.

**Impact:** The migration should reorganize the client behind a dedicated supabase module and require all data access to flow through domain services under [src/lib/services](src/lib/services).

### 4.5 The dependency surface is broader than the Platform Office MVP appears to require

The dependency inventory in [package.json](package.json) includes packages that are consistent with a general admin-template or data-visualization starter, including FullCalendar, D3/TopoJSON, Temporal, and DnD Kit packages. These may be valid for future expansion, but they are not clearly required for the initial Platform Office flows.

**Impact:** The migration should prune or defer these packages during the decommission phase so that the app remains lean and aligned with the PRD’s “reuse before introduce” principle.

---

## 5. Recommendations / Action Items

### Phase 1 — Navigation and route decommissioning

1. Replace the sidebar array in [src/navigation/sidebar/sidebar-items.ts](src/navigation/sidebar/sidebar-items.ts) with Platform Office-focused modules:
   - Overview
   - Workspaces
   - Incidents
   - Audit
   - Health
   - Settings
2. Remove or disable template-era routes and sections such as CRM, Finance, Analytics, Infrastructure, Tasks, Invoice, Users, Roles, and the Legacy section.
3. Keep the existing shell and layout system intact, but retarget the navigation to the operations-console information architecture.

### Phase 2 — Enforce the service-layer barrier

1. Create domain services under [src/lib/services](src/lib/services), for example:
   - [src/lib/services/workspace-service.ts](src/lib/services/workspace-service.ts)
   - [src/lib/services/incident-service.ts](src/lib/services/incident-service.ts)
   - [src/lib/services/provisioning-service.ts](src/lib/services/provisioning-service.ts)
2. Move all Supabase queries behind these services and keep the UI layer free of direct database imports.
3. Restrict all reads to the approved public-schema contract: public.workspaces, public.platform_operators, public.entity_provisioning_status, and public.activity_events.
4. Keep all mutations limited to the approved safe-action RPCs and never introduce generic backend function calls.

### Phase 3 — Mobile-first workflow adaptation

1. Add safe-area-aware padding in [src/app/(main)/dashboard/layout.tsx](src/app/(main)/dashboard/layout.tsx) using the existing layout shell rather than a separate mobile wrapper.
2. Use the mobile breakpoint hook in [src/hooks/use-mobile.ts](src/hooks/use-mobile.ts) to switch destructive actions from dialogs to drawer/sheet surfaces on small viewports.
3. Reuse [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx) for approval, suspension, archive, and recovery workflows so the console remains fully operable on touch devices.
4. Ensure all action buttons and triggers preserve minimum touch target sizes and avoid hover-only behavior.

### Phase 4 — Dependency pruning and simplification

1. Audit [package.json](package.json) for packages that are not required by the Platform Office shell or required UI primitives.
2. Remove or defer packages such as FullCalendar, D3/TopoJSON, Temporal, and DnD Kit unless their usage is confirmed by a real feature requirement.
3. Preserve the existing local UI primitives in [src/components/ui](src/components/ui) and only introduce new dependencies when the current design system cannot meet the need.

### Phase 5 — Route and content migration

1. Replace starter content in dashboard screens with operator-centric views that reflect the PRD workflows: overview, workspace lifecycle, incidents, provisioning health, audit, and settings.
2. Keep route structure colocated with the dashboard shell so that feature code remains close to the owning route, as recommended in AGENTS.md.
3. Introduce empty/loading/error states for slow or failing backend connections, consistent with the PRD’s operations-console requirements.

---

## 6. Dependencies / Blockers

- The migration depends on the availability of the public-schema observability tables and RPCs referenced in the PRD.
- The current repository does not yet have service modules under [src/lib/services](src/lib/services), so the work will need to introduce them as part of the migration.
- Any new mutation path must be reviewed and implemented as a new public-schema RPC rather than a direct database write from the UI layer.

---

## 7. Raw Evidence / References

- [AGENTS.md](AGENTS.md)
- [docs/PRD/platform-office-prd.md](docs/PRD/platform-office-prd.md)
- [docs/PRD/multi-tenancy-prd-v2.1.md](docs/PRD/multi-tenancy-prd-v2.1.md)
- [src/navigation/sidebar/sidebar-items.ts](src/navigation/sidebar/sidebar-items.ts)
- [src/app/(main)/dashboard/users/page.tsx](src/app/(main)/dashboard/users/page.tsx)
- [src/lib/supabase.ts](src/lib/supabase.ts)
- [src/hooks/use-mobile.ts](src/hooks/use-mobile.ts)
- [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx)
- [src/app/(main)/dashboard/layout.tsx](src/app/(main)/dashboard/layout.tsx)
- [package.json](package.json)

---

## 8. Git Status

**Before:**

```text
@Bigdrops ➜ /workspaces/bigdrops-platform-office (main) $ git status --short
```

**After:**

```text
@Bigdrops ➜ /workspaces/bigdrops-platform-office (main) $ git status --short
M  docs/Reports/migration/2026-07-15_github-copilot_platform-office-migration-roadmap.md
```

**Files Modified:**
- [docs/Reports/migration/2026-07-15_github-copilot_platform-office-migration-roadmap.md](docs/Reports/migration/2026-07-15_github-copilot_platform-office-migration-roadmap.md)

---

**Report Generated By:** GitHub Copilot  
**Report Timestamp:** 2026-07-15T00:00:00Z
