# Report: Platform Office Migration Roadmap

**Agent:** GitHub Copilot (MAI-Code-1-Flash)  
**Date:** 2026-07-15  
**Task Type:** Migration  
**Domain:** migration

---

## 1. Executive Summary

This report turns the current repository into an evidence-based migration roadmap for the Platform Office described by the Platform Office PRD. The repository already contains a viable shell, shared UI primitives, a mobile hook, and a drawer primitive, but it still reflects an admin-template experience in navigation, route structure, and direct database access. The migration should therefore focus on decommissioning template-era routes, enforcing the public-schema service boundary, and integrating mobile-first operator workflows without expanding the scope into ERP business data.

---

## 2. Task Scope

This work follows the precedence hierarchy in AGENTS.md:

1. AGENTS.md
2. Platform Office PRD
3. Existing repository reports
4. Multi-Tenancy PRD (context only)

The roadmap is intentionally constrained to platform-operations migration work. It does not broaden scope into tenant business-data features, ERP-level permissions, or non-platform workflows.

---

## 3. Methodology

The roadmap was derived from repository inspection and the PRD contract:

- Reviewed AGENTS.md for reporting requirements, migration guardrails, and the service-layer rule.
- Used the Platform Office PRD as the implementation contract for scope, architecture, and mobile-first behavior.
- Used the Multi-Tenancy PRD only as contextual background for future considerations and not as a source of expanded migration requirements.
- Inspected the live repository structure, especially the sidebar navigation, dashboard shell, mobile hooks, drawer primitive, and Supabase access pattern.

---

## 4. Repository-Derived Dependency Graph

The repository already has an implementation graph that can be repurposed for the Platform Office. The map below is based on actual files and import relationships present on disk.

```mermaid
flowchart TD
    A[src/app/(main)/dashboard/layout.tsx] --> B[src/app/(main)/dashboard/_components/sidebar/app-sidebar.tsx]
    B --> C[src/navigation/sidebar/sidebar-items.ts]
    A --> D[src/components/ui/sidebar.tsx]
    A --> E[src/hooks/use-mobile.ts]
    A --> F[src/components/ui/drawer.tsx]
    G[src/app/(main)/dashboard/_components/sidebar/search-dialog.tsx] --> C
    H[src/app/(main)/dashboard/users/page.tsx] --> I[src/lib/supabase.ts]
    I --> J[Supabase backend contracts]
```

### 4.1 Evidence-based dependency notes

- The dashboard shell in [src/app/(main)/dashboard/layout.tsx](src/app/(main)/dashboard/layout.tsx) is the core integration point for the sidebar, mobile behavior, and page padding.
- The sidebar implementation in [src/app/(main)/dashboard/_components/sidebar/app-sidebar.tsx](src/app/(main)/dashboard/_components/sidebar/app-sidebar.tsx) consumes the navigation array from [src/navigation/sidebar/sidebar-items.ts](src/navigation/sidebar/sidebar-items.ts).
- Search integration in [src/app/(main)/dashboard/_components/sidebar/search-dialog.tsx](src/app/(main)/dashboard/_components/sidebar/search-dialog.tsx) also depends on the same navigation array.
- The mobile and drawer primitives already exist in [src/hooks/use-mobile.ts](src/hooks/use-mobile.ts) and [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx), making them reusable migration assets rather than new dependencies.
- The current database boundary is not yet isolated: [src/app/(main)/dashboard/users/page.tsx](src/app/(main)/dashboard/users/page.tsx) imports the Supabase client directly from [src/lib/supabase.ts](src/lib/supabase.ts).
- The dependency footprint in [package.json](package.json) is wider than the initial Platform Office MVP appears to require, with packages such as FullCalendar, D3/TopoJSON, Temporal, and DnD Kit present.

---

## 5. Critical Implementation Path

The critical implementation path is the sequence of work that must be completed before the repository can reasonably be treated as a Platform Office implementation:

1. Replace the template-era navigation model in [src/navigation/sidebar/sidebar-items.ts](src/navigation/sidebar/sidebar-items.ts).
2. Introduce a service layer under [src/lib/services](src/lib/services) and move database access out of route components.
3. Repoint screens to public-schema observability data and approved RPCs instead of direct tenant-schema or generic backend queries.
4. Apply mobile-first behavior to the operator workflows using the existing mobile and drawer primitives.
5. Verify build/lint health and then prune non-essential dependencies in a controlled late phase.

This path is critical because the navigation contract, service boundary, and mobile ergonomics are interdependent. A screen cannot be considered migrated if it still imports Supabase directly or still presents template-era navigation.

---

## 6. Migration Phases

### Phase 0 — Contract Freeze and Baseline Alignment

**Objective**
Establish the migration boundary and confirm that the work stays aligned to the Platform Office PRD.

**Repository evidence**
- [AGENTS.md](AGENTS.md)
- [docs/PRD/platform-office-prd.md](docs/PRD/platform-office-prd.md)
- [src/app/(main)/dashboard/layout.tsx](src/app/(main)/dashboard/layout.tsx)

**PRD traceability**
- The PRD defines the Platform Office as an operations console with strict public-schema boundaries and a mobile-first operating model.

**Entry criteria**
- The migration scope is understood and the repository guardrails are clear.

**Exit criteria**
- The migration backlog is scoped to navigation, services, mobile adaptation, and dependency cleanup only.

**Dependencies on previous phases**
- None.

**Risks and mitigation**
- Risk: scope drift into ERP features.
- Mitigation: keep the contract anchored to the PRD and use the future-considerations section for out-of-scope items.

**Implementation unlocks**
- Establishes the boundary for all later migration work.

**Mobile integration**
- The shell and navigation are reviewed for touch-first behavior from the outset, even though the main mobile work occurs later.

---

### Phase 1 — Early Decommissioning of Template-Era Navigation and Routes

**Objective**
Replace the starter-dashboard navigation model with the Platform Office information architecture.

**Repository evidence**
- [src/navigation/sidebar/sidebar-items.ts](src/navigation/sidebar/sidebar-items.ts)
- [src/app/(main)/dashboard/_components/sidebar/app-sidebar.tsx](src/app/(main)/dashboard/_components/sidebar/app-sidebar.tsx)
- [src/app/(main)/dashboard/_components/sidebar/search-dialog.tsx](src/app/(main)/dashboard/_components/sidebar/search-dialog.tsx)

**PRD traceability**
- The PRD requires an operations-console experience centered on overview, workspace lifecycle, incidents, audit, health, and settings rather than generic admin routes.

**Entry criteria**
- Phase 0 complete.

**Exit criteria**
- The sidebar and search experience no longer advertise template-era routes such as CRM, Finance, Analytics, Infrastructure, or Legacy dashboards.

**Dependencies on previous phases**
- Depends on baseline alignment from Phase 0.

**Risks and mitigation**
- Risk: incomplete route removal can leave dead entry points in the shell.
- Mitigation: decommission navigation entries and disable orphaned routes in a single pass rather than incrementally.

**Implementation unlocks**
- Makes the shell visibly Platform Office-oriented and reduces future confusion during screen migration.

**Mobile integration**
- Navigation should be touch-friendly, avoid hover-only affordances, and remain usable in the compact mobile shell.

---

### Phase 2 — Establish the Service-Layer Boundary and Public-Schema Contract

**Objective**
Enforce the strict no-cross data-isolation rule by moving all database access behind services that only use the public-schema observability contract.

**Repository evidence**
- [src/lib/supabase.ts](src/lib/supabase.ts)
- [src/app/(main)/dashboard/users/page.tsx](src/app/(main)/dashboard/users/page.tsx)
- [src/lib](src/lib)

**PRD traceability**
- The PRD explicitly requires that presentational UI routes and components not import or query the Supabase client directly, and that all database access flow through domain services.

**Entry criteria**
- The target route structure from Phase 1 exists.

**Exit criteria**
- No presentational page or layout imports the Supabase client directly.
- All reads and writes are routed through services under [src/lib/services](src/lib/services).

**Dependencies on previous phases**
- Depends on the new route structure from Phase 1 so services can be mapped to the target screens.

**Risks and mitigation**
- Risk: a screen or utility still bypasses the service layer.
- Mitigation: enforce an explicit rule that services are the only permitted database boundary and review new data calls before integration.

**Implementation unlocks**
- Enables the platform screens to be migrated safely without violating the PRD’s isolation requirements.

**Mobile integration**
- Service-driven loading, empty, and error states should be compact and resilient on small screens, especially for operator workflows that may run over slower networks.

---

### Phase 3 — Migrate Core Operator Screens to Platform Office Workflows

**Objective**
Replace starter dashboard screens with operator-centric views that reflect the PRD’s lifecycle and observability domains.

**Repository evidence**
- [src/app/(main)/dashboard](src/app/(main)/dashboard)
- [src/navigation/sidebar/sidebar-items.ts](src/navigation/sidebar/sidebar-items.ts)
- [src/app/(main)/dashboard/layout.tsx](src/app/(main)/dashboard/layout.tsx)

**PRD traceability**
- The PRD calls for overview, workspace lifecycle, incidents, provisioning health, audit, and settings flows rather than generic CRUD administration.

**Entry criteria**
- Phase 2 has established service-backed data access.

**Exit criteria**
- The primary screens reflect the intended Platform Office workflows and are backed by the public-schema service layer.

**Dependencies on previous phases**
- Depends on the service boundary from Phase 2.

**Risks and mitigation**
- Risk: migrating screens while still using legacy template content or placeholder data.
- Mitigation: make each screen map directly to a PRD workflow and review it against the public-schema contract.

**Implementation unlocks**
- Produces the first complete operator-facing experience rather than a shell with demo routes.

**Mobile integration**
- Screen layouts should transform into dense card/list patterns on small viewports rather than assuming desktop table-only behavior.

---

### Phase 4 — Mobile-First Workflow Integration Across Operator Actions

**Objective**
Ensure that all critical operator workflows are usable on mobile viewports using the existing mobile and drawer primitives.

**Repository evidence**
- [src/hooks/use-mobile.ts](src/hooks/use-mobile.ts)
- [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx)
- [src/app/(main)/dashboard/layout.tsx](src/app/(main)/dashboard/layout.tsx)

**PRD traceability**
- The PRD requires that critical operator workflows be executable on mobile and that destructive actions degrade from dialog to drawer/sheet patterns.

**Entry criteria**
- The main workflows exist from Phase 3.

**Exit criteria**
- Approval, suspension, archive, recovery, and other critical actions remain functional on mobile and use touch-friendly surfaces.

**Dependencies on previous phases**
- Depends on the screens and actions from Phase 3.

**Risks and mitigation**
- Risk: mobile adaptation is implemented as a cosmetic change only.
- Mitigation: verify that actual workflows remain operable with touch targets, safe-area spacing, and drawer-based action surfaces.

**Implementation unlocks**
- This phase makes the console genuinely operational for field or on-the-go use rather than desktop-only administration.

**Mobile integration**
- This phase is explicitly where the PRD’s mobile-first requirements are integrated into the actual workflows rather than treated as a separate styling exercise.

---

### Phase 5 — Late Optimization and Dependency Pruning

**Objective**
Reduce the dependency footprint to what the Platform Office MVP truly needs after core functionality is stable.

**Repository evidence**
- [package.json](package.json)
- [src/components/ui](src/components/ui)

**PRD traceability**
- The PRD requires reuse of existing local UI primitives before introducing new dependencies and prefers lean implementation over dependency bloat.

**Entry criteria**
- The core flows from Phases 2–4 are stable enough to verify real usage.

**Exit criteria**
- The dependency set aligns with the Platform Office shell and interaction model, with no obvious drag from unused template-era packages.

**Dependencies on previous phases**
- Depends on feature stability from the prior phases.

**Risks and mitigation**
- Risk: dependency pruning occurs too early and breaks the app.
- Mitigation: treat pruning as a late phase following build and lint verification.

**Implementation unlocks**
- Produces a leaner, better-maintained Platform Office build.

**Mobile integration**
- This phase should not introduce mobile-only dependencies or regressions; it should only remove unneeded weight.

---

## 7. Compile-Safe Checkpoints

The migration should be gated by explicit checkpoints so that the repository remains build-safe at each step:

1. After Phase 1: verify the shell still builds and the sidebar renders without broken imports.
2. After Phase 2: verify the app still builds after the service boundary is introduced and no route component directly imports the Supabase client.
3. After Phase 3: verify the core screens render and the new operator workflows are build-safe.
4. After Phase 4: verify the mobile workflow surfaces and drawer-based actions compile and function properly.
5. After Phase 5: rerun lint and build to confirm the dependency pruning did not introduce regressions.

Suggested validation commands from the repository configuration:
- bun run lint
- bun run build

These should be treated as required gates for each phase transition.

---

## 8. Two-Stage Cleanup Strategy

### 8.1 Early decommissioning strategy

The first cleanup stage should remove dead routes and template-era navigation early in the migration:

- Replace the sidebar items in [src/navigation/sidebar/sidebar-items.ts](src/navigation/sidebar/sidebar-items.ts).
- Remove or disable generic admin-style routes from the shell experience.
- Keep the shell intact while changing the content model to Platform Office domains.

This is the shortest path to a correct product experience.

### 8.2 Late optimization strategy

The second cleanup stage should happen after the feature set is stable:

- Trim dependency usage in [package.json](package.json) only once the Platform Office workflows are proven and build-safe.
- Remove or defer packages that are not required by the local UI system and the core operations flows.
- Avoid broad dependency cleanup during the first migration phases because it can obscure the more important data-boundary and navigation work.

---

## 9. Cross-Cutting Mobile Integration Requirements

Mobile integration is not isolated to a single phase. It should be considered in every phase:

- Navigation and shell interactions must remain touch-friendly.
- The dashboard layout should account for safe-area spacing and compact mobile presentation.
- Dialog-driven destructive actions should degrade to drawer/sheet surfaces on smaller viewports using [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx).
- Touch target sizes and thumb-reach considerations should be preserved across all new operator surfaces.
- Loading and error states should remain readable and usable on small screens.

These requirements directly reflect the PRD’s mobile-first operations philosophy.

---

## 10. High-Risk Areas

### 10.1 Data-isolation regression

**Risk:** a new screen or helper bypasses the service layer and accesses tenant-isolated business schemas.

**Mitigation:** treat services as the only database boundary and review each new query against the public-schema contract.

### 10.2 Scope creep into non-platform workflows

**Risk:** the migration absorbs ERP business features from the Multi-Tenancy PRD.

**Mitigation:** keep the implementation anchored to the Platform Office PRD and record any broader multi-tenancy topics under future considerations.

### 10.3 Mobile workflow regression

**Risk:** workflows remain desktop-centric or rely on hover-only behavior.

**Mitigation:** validate each critical action on small viewports and use the drawer primitive for destructive interactions.

### 10.4 Dependency overreach

**Risk:** the migration inherits a large amount of starter-dashboard bloat.

**Mitigation:** defer dependency pruning until after the functional migration is stable and use the local UI primitives first.

---

## 11. Future Considerations (Out of Scope for This Migration)

The following items are relevant to the broader Platform Office direction but should remain outside the current migration scope unless explicitly required by the Platform Office PRD:

- MFA step-up and console session policy enforcement.
- A richer incident model beyond the initial observability contract.
- Entitlement overrides and billing-related controls.
- Broader audit-correlation workflows beyond the initial public activity log usage.

These items belong in a future-concerns section because they are tied to the larger multi-tenancy architecture but are not required to establish the initial Platform Office migration.

---

## 12. Raw Evidence / References

- [AGENTS.md](AGENTS.md)
- [docs/PRD/platform-office-prd.md](docs/PRD/platform-office-prd.md)
- [docs/PRD/multi-tenancy-prd-v2.1.md](docs/PRD/multi-tenancy-prd-v2.1.md)
- [src/app/(main)/dashboard/layout.tsx](src/app/(main)/dashboard/layout.tsx)
- [src/app/(main)/dashboard/_components/sidebar/app-sidebar.tsx](src/app/(main)/dashboard/_components/sidebar/app-sidebar.tsx)
- [src/app/(main)/dashboard/_components/sidebar/search-dialog.tsx](src/app/(main)/dashboard/_components/sidebar/search-dialog.tsx)
- [src/navigation/sidebar/sidebar-items.ts](src/navigation/sidebar/sidebar-items.ts)
- [src/hooks/use-mobile.ts](src/hooks/use-mobile.ts)
- [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx)
- [src/lib/supabase.ts](src/lib/supabase.ts)
- [src/app/(main)/dashboard/users/page.tsx](src/app/(main)/dashboard/users/page.tsx)
- [package.json](package.json)

---

## 13. Git Status

**Before:** N/A

**After:**

```text
?? docs/Reports/migration/platform-office-migration-roadmap2.md
```

**Files Modified:**
- [docs/Reports/migration/platform-office-migration-roadmap2.md](docs/Reports/migration/platform-office-migration-roadmap2.md)

---

**Report Generated By:** GitHub Copilot  
**Report Timestamp:** 2026-07-15T00:00:00Z
