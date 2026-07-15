# AGENTS.md

## Project Overview

BIGDROPS Platform Office is a high-density, responsive operations console (NOC) built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, and shadcn/ui.

It functions as an isolated SaaS control plane, running independently of the core customer-facing ERP application. It shares only the underlying Supabase backend database and authentication pool.

---

## Critical Agent Guardrails

### 1. The "No-Cross" Data Isolation Rule

You must never write code, hooks, or queries that attempt to access tenant-specific isolated schemas (`workspace_xxxx`). The Platform Office must remain completely blind to tenant business data.

- **Allowed:** Querying high-level metadata in the `public` schema (e.g., `public.workspaces`, `public.platform_operators`, `public.entity_provisioning_status`).
- **Prohibited:** Querying or introspecting transactional business tables (e.g., `invoices`, `waybills`, `projects`, `documents`) inside isolated workspace schemas.

### 2. Authorization Domain Enforcement

Do not use ERP-level workspace permissions or roles. Platform authorization must be handled exclusively by checking roles against `public.platform_operators` (e.g., checking if the user matches `role = 'owner'`).

### 3. Safe-Action Allowlist

Do not write or invoke generic, destructive, or highly privileged database functions. Instead, use the pre-approved RPCs defined in the `public` schema:

- `approve_workspace(p_workspace_id, p_creator_user_id)`
- `suspend_workspace(p_workspace_id)`
- `archive_workspace(p_workspace_id)`
- `recover_workspace(p_workspace_id)`

If a new mutation is needed, it must be defined as a new RPC in the `public` schema and reviewed before implementation.

---

## Setup & Commands

This project uses Bun as its package manager and runtime. Do not use npm or yarn.

```bash
# Install dependencies
bun install

# Start the development server
bun dev

# Build the production application
bun run build

# Run linting
bun run lint
```

---

Co-location-Based Directory Structure

Keep feature code as close as possible to the route that owns it. Do not move screen-specific code into shared directories prematurely.

```
src/
├── app/
│   ├── (auth)/                  # Login and MFA step-up routes
│   └── (dashboard)/             # Main layout, shell, and sidebar items
│       ├── overview/            # NOC home screen / health dashboard
│       ├── provisioning/        # Tenant lifecycle management screen
│       │   ├── _components/     # Screen-specific components
│       │   └── page.tsx         # Provisioning route entry point
│       └── incidents/           # Platform incident tracking screen
├── components/                  # Shared application UI components
│   └── ui/                      # Local shadcn components
├── hooks/                       # Reusable custom React hooks
├── lib/                         # Global utility functions and config
│   └── supabase/                # Supabase client setup and type definitions
├── styles/                      # Global styles and Tailwind configuration
└── types/                       # Shared platform-wide TypeScript definitions
```

Supabase imports: The Supabase client is exported from @/lib/supabase/client and types from @/lib/supabase/types.

---

Designing and Extending Screens

1. Server Components by Default: Keep page files (page.tsx) small, clean, and as Server Components. Extract browser-interactive elements into dedicated Client Components marked with "use client" in the _components/ directory.
2. High Information Density: The Platform Office is an operations console, not a marketing application. Avoid excessive vertical whitespace. Use highly compact table rows, small text hierarchies, dense grid cards, and clear status indicators to maximize visible data on a single screen.
3. State Machine UI: When building interfaces to manage workspaces, treat status as transitions inside a state machine (Requested → AwaitingApproval → Provisioning → Active → Suspended → Archived → Purged) rather than straight row updates.
4. Data Fetching: When fetching data for Platform Office screens, ensure all Supabase queries target only public-schema tables (public.workspaces, public.platform_operators, public.entity_provisioning_status). Never use .from('workspace_xxxx.invoices') or similar. Use public.entity_provisioning_status as the sole source of truth for tenant creation and provisioning health.
5. Error & Loading States: Always design for slow or failing connections. Implement React Suspense boundaries, skeleton loaders for data tables, empty states with clear calls to action, and descriptive toast errors for failed backend queries.

---

Code Conventions

· TypeScript Strict Mode: Enforced. Use explicit, precise types. Do not use the any type under any circumstances.
· Import Aliases: Always use @/ path aliases for imports from the src/ directory.
· Formatting: Adhere to the configured linter and formatter settings. Use double quotes, semicolons, and two-space indentations.
· Safeguards: Destructive platform operations (such as workspace suspension or tenant purging) must always be built with two-step confirmation modals.

---

Related Documentation

· Platform Office PRD
· Multi-Tenancy PRD

```

---