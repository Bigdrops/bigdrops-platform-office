# Platform Office Repository Audit

**Date:** 2026-07-15  
**Scope:** Audit of the inherited Next.js 15 admin dashboard repository for the BIGDROPS Platform Office migration  
**Status:** Investigation only — no application source files modified

---

## Executive Summary

The repository already contains a strong foundation for a Platform Office operations console, but it is still heavily shaped by an inherited admin-template starter. The most valuable assets are:

- a mature shadcn-style UI primitive layer in [src/components/ui](src/components/ui)
- a responsive dashboard shell with sidebar + mobile sheet behavior in [src/app/(main)/dashboard](src/app/(main)/dashboard)
- a theme and preference system with runtime attribute application in [src/lib/preferences](src/lib/preferences)
- a Supabase client boundary in [src/lib/supabase.ts](src/lib/supabase.ts)

The main risks are that the current application is branded as “Studio Admin,” contains many demo dashboards and legacy variants, and does not yet reflect the Platform Office’s public-schema-only, operations-centric contract. The audit therefore recommends reusing the shell, theming, and shared primitives while replacing or retiring the template-specific branding, demo content, and data assumptions.

---

## 1. Repository Structure

### Major application folders

- [src/app](src/app)  
  The app router entrypoint. It contains both the public shell and the main dashboard experience.

- [src/app/(main)](src/app/(main))  
  The primary authenticated application area. It contains the dashboard shell, auth routes, and the unauthorized view.

- [src/components](src/components)  
  Shared UI primitives and utility components. The largest concentration of reusable infrastructure lives here.

- [src/components/ui](src/components/ui)  
  Local shadcn-style component wrappers. This is the primary design-system foundation.

- [src/navigation](src/navigation)  
  Navigation data and sidebar configuration.

- [src/lib](src/lib)  
  Shared infrastructure such as styling, fonts, preferences, cookies, local storage helpers, and the Supabase client.

- [src/stores](src/stores)  
  Client-side state management. The preferences store is the most developed example.

- [src/server](src/server)  
  Server actions, currently used for preference persistence.

- [src/data](src/data)  
  Static demo or fallback content, including a users dataset.

- [src/styles](src/styles)  
  Global CSS, theme presets, and icon CSS assets.

### Routing groups

- [(external)](src/app/(external))  
  A lightweight route group for public-facing or external landing content.

- [(main)](src/app/(main))  
  The main authenticated application shell. This is the most relevant area for Platform Office migration.

- Auth routes under [src/app/(main)/auth](src/app/(main)/auth)  
  Login and registration examples are present but are not tied to the Platform Office authorization model yet.

- Dashboard routes under [src/app/(main)/dashboard](src/app/(main)/dashboard)  
  The largest cluster of template pages: default, crm, finance, analytics, infrastructure, invoice, users, roles, productivity, plus legacy variants.

### Layouts

- [src/app/layout.tsx](src/app/layout.tsx)  
  Root layout with providers, theme boot script, toaster, tooltip provider, and preferences provider.

- [src/app/(main)/dashboard/layout.tsx](src/app/(main)/dashboard/layout.tsx)  
  Dashboard shell with sidebar, header, search, theme switcher, layout controls, and content container.

### Providers

- Preferences provider and Zustand store in [src/stores/preferences](src/stores/preferences)  
  Strong reusable foundation for global shell preferences.

- Tooltip provider at the root layout  
  Lightweight and appropriate for future console usage.

- No React Query provider is present. The current data layer is not using a query client abstraction.

### Shared infrastructure

- [src/lib/preferences](src/lib/preferences)  
  The preference engine is notably sophisticated and should be preserved.

- [src/lib/fonts/registry.ts](src/lib/fonts/registry.ts)  
  Font registry is comprehensive and can be adapted, though Platform Office likely does not need the full set.

- [src/components/ui/sidebar.tsx](src/components/ui/sidebar.tsx)  
  Robust sidebar and mobile sheet implementation.

- [src/components/ui/command.tsx](src/components/ui/command.tsx) and [src/app/(main)/dashboard/_components/sidebar/search-dialog.tsx](src/app/(main)/dashboard/_components/sidebar/search-dialog.tsx)  
  Good reusable navigation/search infrastructure.

### What appears tightly coupled to the original admin template

The following appear most template-specific and should be treated as disposable or heavily adapted:

- the “Studio Admin” branding and metadata in [src/config/app-config.ts](src/config/app-config.ts)
- the dashboard routes for CRM, finance, analytics, infrastructure, productivity, and invoice
- the legacy dashboard variants under [src/app/(main)/dashboard/(legacy)](src/app/(main)/dashboard/(legacy))
- the author/support card and GitHub link in the sidebar shell
- the static demo data and sample users in [src/data](src/data)

---

## 2. Existing UI Component Inventory

The repository contains a broad local shadcn-style component library. This is a major strength and should be reused rather than replaced.

### Component decisions

| Area | Decision | Why |
|---|---|---|
| Buttons | Keep | The button system is mature and already supports primary, outline, secondary, ghost, destructive, and icon variants. |
| Cards | Keep / Adapt | Card primitives are useful for dense operational panels; they should be adapted to a more compact, status-oriented layout. |
| Dialogs | Keep | Alert-dialog and dialog wrappers are already in place and fit confirmation workflows. |
| Drawers | Adapt | A drawer layer already exists, but it is currently used mainly for legacy table demos. It is useful for secondary detail panels, but should not become the default interaction mode. |
| Tables | Adapt | Table primitives and TanStack table integration are present, but current table implementations are template-oriented and should be reworked for operations views. |
| Sheets | Keep | The sheet implementation is already being used for the mobile sidebar and is appropriate for mobile panels. |
| Badges | Keep | Status badges are well aligned with incident, health, and lifecycle views. |
| Forms | Keep / Adapt | Input, field, select, checkbox, textarea, switch, and input-group wrappers are suitable; they just need stricter Platform Office patterns. |
| Navigation | Adapt | Sidebar, dropdown, collapsible, command palette, and breadcrumb infrastructure are strong; current menu labels and grouping are template-driven. |
| Charts | Adapt | Recharts wrappers are present and reusable, but should be simplified and used sparingly for operational KPIs rather than broad marketing-style analytics. |
| Data display | Keep / Adapt | The repository already has components for empty states, loaders, avatars, progress, separators, and more. These are appropriate. |
| Loading components | Keep | Skeleton and spinner components are suitable for data-heavy screens. |
| Empty states | Keep | The empty component is useful for incident lists, audit views, and empty datasets. |

### Specific recommendations

- Keep: [src/components/ui/button.tsx](src/components/ui/button.tsx), [src/components/ui/card.tsx](src/components/ui/card.tsx), [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx), [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx), [src/components/ui/badge.tsx](src/components/ui/badge.tsx), [src/components/ui/empty.tsx](src/components/ui/empty.tsx), [src/components/ui/skeleton.tsx](src/components/ui/skeleton.tsx), [src/components/ui/sidebar.tsx](src/components/ui/sidebar.tsx)
- Adapt: [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx), [src/components/ui/chart.tsx](src/components/ui/chart.tsx), [src/components/ui/table.tsx](src/components/ui/table.tsx), [src/components/ui/command.tsx](src/components/ui/command.tsx)
- Replace: template-driven page-specific widgets and legacy interaction patterns, especially those under [src/app/(main)/dashboard/(legacy)](src/app/(main)/dashboard/(legacy))
- Delete: demo-oriented support/marketing shell content and route-specific UI that exists only to demonstrate the admin template

---

## 3. Existing Dependencies

The dependency inventory is broad, and several packages appear to be present for demo or template functionality rather than the Platform Office’s core requirements.

| Dependency | Why it exists | Actively used? | Redundant? | Should remain? | Notes |
|---|---|---|---|---|---|
| next, react, react-dom | Core framework | Yes | No | Yes | Required for the app router and component model. |
| tailwindcss, postcss, @tailwindcss/postcss | Styling pipeline | Yes | No | Yes | Core styling stack. |
| typescript, @biomejs/biome | Type safety and linting | Yes | No | Yes | Good fit for the repo. |
| lucide-react | Icons | Yes | No | Yes | Widely used across the navigation and dashboard UI. |
| @supabase/supabase-js, @supabase/ssr | Supabase client access | Yes, but only minimally | No | Yes | Keep, but the integration should be refactored around public-schema observability contracts. |
| zustand | Client state | Yes | No | Yes | Used for preferences state and should remain. |
| next-themes | Theme switching | Yes | No | Yes | Already integrated into the shell. |
| sonner | Toasts | Yes | No | Yes | Appropriate for operational feedback. |
| recharts | Charts | Yes | No | Yes | Useful, but should be scoped to a smaller set of visualizations. |
| @tanstack/react-table | Table infrastructure | Yes | No | Yes | Good for operations tables. |
| react-hook-form, zod, @hookform/resolvers | Form handling | Likely yes | No | Yes | Appropriate for future console forms. |
| radix-ui | Core primitives for dialog/sheet/dropdown etc. | Yes | No | Yes | Already used through shadcn-style wrappers. |
| vaul | Drawer implementation | Yes | No | Yes | Already present and currently used by the local drawer wrapper. No additional drawer package is needed. |
| cmdk | Command palette | Yes | No | Yes | Useful for search and command-style navigation. |
| @base-ui/react | Combobox infrastructure | Yes | No | Possibly | It is only used by the local combobox wrapper; it can remain if comboboxes are needed. |
| @dnd-kit/core, @dnd-kit/modifiers, @dnd-kit/sortable | Drag-and-drop table reordering | Only in legacy/demo areas | Possibly | Maybe | Likely candidates to remove if the legacy table experiences are retired. |
| embla-carousel-react | Carousel UI | Likely only used by the generic carousel component | Possibly | Maybe | Probably unnecessary unless carousels are intentionally used. |
| @fullcalendar/react | Calendar UI | Not found in current app usage | Yes | No | Strong candidate to remove if no concrete calendar workflow is planned. |
| d3-geo, topojson-client | Geo/chart utilities | Not found in current app usage | Yes | No | Likely leftover template support. |
| temporal-polyfill | Temporal helpers | Not found in current app usage | Yes | No | Likely unnecessary for the current Platform Office scope. |
| simple-icons | Social/brand icons | Yes, but mostly in template shell | No | Maybe | Keep only if the Platform Office wants explicit brand/status icons; otherwise trim. |
| shadcn | CLI/package wrapper | Indirectly used through the local component layer | No | Maybe | Keep only if code generation is part of the workflow; runtime need is minimal. |

### Dependency opportunities to trim

The most obvious candidates for reduction are:

- @fullcalendar/react
- d3-geo
- topojson-client
- temporal-polyfill
- the DnD Kit packages if the legacy demos are removed
- any heavy demo-only carousel/calendar functionality that is not part of the Platform Office roadmap

The repository does not appear to need additional mobile or UI packages beyond what is already present. The current dependency surface is already broad enough without introducing a new package set.

---

## 4. Mobile Capability Audit

### What already exists

- Drawer implementation: Yes, via [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx)
- Bottom sheet: Yes, implemented through the drawer with bottom-direction support and vaul
- Responsive dialog: Yes, via the dialog/sheet wrapper layer
- Responsive sidebar: Yes, via [src/components/ui/sidebar.tsx](src/components/ui/sidebar.tsx)
- Media query hook: Yes, [src/hooks/use-mobile.ts](src/hooks/use-mobile.ts)
- Mobile navigation: Yes, the dashboard sidebar uses a mobile sheet and the search dialog is available
- Safe-area handling: No explicit safe-area utilities were found
- Touch optimizations: Minimal; no obvious touch-specific spacing, hit-area, or viewport handling beyond standard Tailwind classes

### Assessment

The repository is already mobile-capable enough for a console shell. It does not appear to need additional packages such as Vaul beyond what is already present, because the current drawer implementation is already wiring the same capability through a local wrapper.

### Main gap

The biggest mobile gap is not missing packages, but the lack of explicit safe-area handling and touch-focused interaction polish for future Capacitor-like packaging. The existing shell is responsive, but the Platform Office would still need to tighten mobile ergonomics around bottom sheets, confirmation flows, and detail panels.

---

## 5. Navigation Audit

### Current sidebar architecture

The sidebar is built from a reusable pattern:

- [src/app/(main)/dashboard/layout.tsx](src/app/(main)/dashboard/layout.tsx) hosts the sidebar provider and header
- [src/app/(main)/dashboard/_components/sidebar/app-sidebar.tsx](src/app/(main)/dashboard/_components/sidebar/app-sidebar.tsx) composes the shell
- [src/app/(main)/dashboard/_components/sidebar/nav-main.tsx](src/app/(main)/dashboard/_components/sidebar/nav-main.tsx) renders the menu tree based on config
- [src/navigation/sidebar/sidebar-items.ts](src/navigation/sidebar/sidebar-items.ts) holds the navigation definitions

### Menu configuration

The menu is currently data-driven and suitable for reuse. However, the menu content is still a generic admin-template list: Default, CRM, Finance, Analytics, Productivity, E-commerce, infrastructure, etc.

### Routing strategy

Navigation uses route-based active states through the current pathname. This is a good fit for the Platform Office and should be preserved.

### Icon system

Icons rely on lucide-react, which is a good fit for operations-oriented sections.

### Permission awareness

The current navigation is not permission-aware. It is purely static and does not express platform-operator roles or access boundaries.

### Mobile behavior

The sidebar switches to a mobile sheet on narrow viewports, which is appropriate for the future console.

### Recommended evolution

The nav framework should evolve without a rewrite by changing the menu configuration and labels to:

- Overview
- Workspaces
- Incidents
- Audit
- Health
- Settings

The core sidebar architecture is already strong enough for this; the main work would be content and route mapping rather than structural redesign.

---

## 6. Dashboard Audit

### Reusable infrastructure

The following pieces are strong candidates for reuse in the Platform Office:

- the dashboard shell and content padding model
- the responsive grid layout pattern
- card-based summary panels
- the chart container and chart wrappers
- the header/search/theme controls
- the sidebar and page-shell composition
- the tabbed content and section spacing model

### Disposable or demo content

The following pieces are clearly templateized and should be treated as disposable during migration:

- CRM metrics and pipeline pages
- finance dashboards and personal-finance widgets
- ecommerce and productivity demos
- analytics pages focused on marketing-like traffic reporting
- infrastructure pages that feel more like a software stack showcase than an operations console
- legacy variants under [src/app/(main)/dashboard/(legacy)](src/app/(main)/dashboard/(legacy))

### Assessment

The dashboard foundation is reusable, but the current page content is not. The migration should preserve the layout system and visual rhythm while replacing the demo screens with operational interfaces.

---

## 7. Styling Audit

### Global styling foundation

The global stylesheet in [src/app/globals.css](src/app/globals.css) already defines:

- Tailwind CSS import and theme layers
- CSS custom properties for color, radius, charts, and sidebar surfaces
- dark-mode support
- preset-based theming through data attributes
- typography and font-variable support

### Theme variables

The current design system already exposes semantic tokens such as:

- background / foreground
- primary / secondary / accent / destructive
- card / popover / input / border / ring
- sidebar-specific tokens
- chart color tokens

### Assessment

The existing token system is strong enough to support a Platform Office severity model. A future “severity” system for incidents, health, and provisioning states can be implemented by extending the existing semantic token set rather than introducing a parallel visual styling system.

### Recommendation

Use existing tokens as the canonical source for status color mapping, especially:

- success/healthy states
- warning/attention states
- critical/error states
- neutral/unknown states

A severity palette can be layered on the current theme variables without introducing a separate styling framework.

---

## 8. Data Layer Audit

### Supabase integration

The repository currently contains a simple Supabase client at [src/lib/supabase.ts](src/lib/supabase.ts). This is a suitable starting point, but it is not yet aligned with the Platform Office requirements.

### Current state

- The client is initialized directly and exported.
- A page under [src/app/(main)/dashboard/users/page.tsx](src/app/(main)/dashboard/users/page.tsx) queries workspace-related tables directly.
- There is no public-schema-only abstraction layer.
- There is no dedicated platform-operator auth or role-gating layer.

### React Query

No React Query or query-client provider is present. The repository is currently using direct async data fetching patterns rather than a formal server state abstraction.

### Zustand

Zustand is present and already used for preferences. This is a good fit for lightweight client-side state but not a complete answer for Platform Office data orchestration.

### API layer

The current server layer in [src/server/server-actions.ts](src/server/server-actions.ts) is limited to cookie persistence. There is no established API wrapper or RPC abstraction for Platform Office operations.

### Authentication flow

Authentication routes exist, but the repository is not yet aligned with the PRD’s console-specific requirements around:

- platform-only authorization
- MFA step-up gating
- public-schema-only queries
- safe-action allowlists

### Assessment

The existing Supabase boundary is reusable, but the current data layer is not yet suitable for the Platform Office’s security model. The migration should preserve the Supabase client concept while replacing the current table-level assumptions with a public-schema-first data contract.

---

## 9. Performance & Mobile Readiness

### Bundle risks

The current codebase contains a large number of UI components and several chart/table libraries. That is not inherently a problem, but it increases the bundle surface compared with the Platform Office’s likely initial scope.

### Heavy libraries

The heaviest visual dependencies appear to be:

- recharts
- the large local component catalog
- table and chart wrappers that are used across many template pages

These are not blockers, but they should be consciously trimmed and scoped to the minimum required by the Platform Office experience.

### Rendering strategy

The app is already using the Next.js App Router, which is appropriate for the Platform Office. The current shell is also broadly compatible with server components and streaming-friendly patterns.

### Responsive behavior

The existing shell is fairly well-prepared for responsive use, especially because the sidebar already shifts to a mobile sheet and the layout uses responsive spacing and grids.

### Capacitor-style packaging readiness

The repository is moderately ready for future packaging scenarios, but not yet optimized for them. The biggest gaps are:

- no explicit safe-area handling
- no strong mobile-specific interaction polish
- no platform-specific navigation or session behavior yet

This is a manageable gap rather than a structural blocker.

---

## 10. Migration Matrix

| Area | Keep | Adapt | Replace | Delete | Notes |
|---|---|---|---|---|---|
| Application shell | Yes |  |  |  | The root layout and dashboard shell are strong foundations. |
| Sidebar/navigation |  | Yes |  |  | Keep the structure, replace the menu content and labels. |
| Theme & preferences | Yes |  |  |  | This is one of the strongest reusable systems in the repo. |
| UI primitives | Yes |  |  |  | The component layer is already substantial and should be reused. |
| Mobile shell |  | Yes |  |  | Mobile sidebar and drawer behavior are already present. |
| Chart system |  | Yes |  |  | Keep the wrapper, but simplify the visual usage. |
| Table system |  | Yes |  |  | TanStack tables are good and can be adapted. |
| Dashboard pages |  |  | Yes |  | Current pages are template-style and should be replaced with operations views. |
| Legacy demo routes |  |  |  | Yes | These are clearly not aligned with the Platform Office scope. |
| Branding and metadata |  |  | Yes |  | “Studio Admin” should be replaced with Platform Office wording. |
| Data access layer |  |  | Yes |  | Current direct table queries need to move to public-schema observability patterns. |
| Authentication and authorization |  |  | Yes |  | The current route structure is not yet aligned to the PRD. |
| Demo data and sample users |  |  |  | Yes | Replace with platform-operator or public-schema data models. |
| Dependency set |  | Yes |  |  | Trim template-heavy packages while preserving the core UI and data stack. |

---

## Key Recommendations

1. Reuse the shell, shadcn-style primitives, sidebar system, and theme/preference framework.
2. Treat the current dashboard pages as disposable demo content rather than reusable business logic.
3. Replace template branding and generic admin labels with Platform Office terminology and mission-oriented navigation.
4. Keep the existing mobile layout approach, but add a stronger operational focus and safe-area awareness later.
5. Rebuild the data access model around public-schema observability rather than workspace-specific business tables.
6. Avoid introducing new UI or mobile dependencies unless a concrete Platform Office workflow clearly requires them.

## Risks to Monitor

- The repository still carries strong template branding and content that could dilute the Platform Office identity.
- The current data layer is not yet aligned with the “no-cross” isolation rule and should not be treated as a production-ready foundation.
- The broad component and dependency inventory may encourage overbuilding before the operational requirements are fully shaped.
- The existence of many demo pages could create migration churn unless the team explicitly treats them as removable scaffolding.

## Bottom Line

The repository is not a blank slate, but it is also not yet a Platform Office codebase. It is strongest as a shell, theming, and UI infrastructure foundation. The migration should preserve those strengths and replace the template-specific content, branding, and data assumptions with an operations-console architecture grounded in the PRD.
