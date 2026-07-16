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

## Skills

For any task that involves writing, modifying, or reviewing code, you **must** use the appropriate skills from the index.

1. Read `docs/ProjectSkillIndex.md` first to see what skills are available.
2. Load the relevant skill(s) before starting the task.
3. Reference which skill(s) you used in your report.

Do not start a code-related task without checking the skill index first.

---

## Reports

All work requires a report.

**Location:** `docs/Reports/[domain]/` — use existing domain folder or create a new one if needed.

**Filename:** `YYYY-MM-DD_<agent-name>_<topic-slug>.md`

**Minimum structure:**
- Agent name and date
- Summary of what was done
- Key findings
- Recommendations / action items
- Git status (before/after)

**Zero-Code Investigation Rule:** When auditing or exploring, do not modify source files. Log `git status` before and after.

---

## Service Layer Rule

UI components **must not** import or query Supabase directly. All database operations go through domain-specific service wrappers in `src/lib/services/`.

---

## UI Reuse Policy

1. **Keep/Reuse:** Use existing UI primitives in `src/components/ui/`.
2. **Adapt:** Extend existing primitives via variants.
3. **Build:** Only introduce new components when existing ones cannot satisfy the requirement.

---

## Mobile-First

- No hover-dependent logic.
- Touch targets minimum 44×44 CSS pixels.
- Respect safe-area insets.
- Dialogs → bottom sheets on mobile.

---

## Setup & Commands

This project uses Bun. Do not use npm or yarn.

```bash
bun install
bun dev
bun run build
bun run lint
```

---

Directory Structure

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
├── lib/
│   ├── services/                # Domain-specific service wrappers (only files permitted to call Supabase)
│   │   ├── workspace-service.ts
│   │   ├── incident-service.ts
│   │   └── provisioning-service.ts
│   └── supabase/                # Supabase client setup and type definitions
├── styles/                      # Global styles and Tailwind configuration
└── types/                       # Shared platform-wide TypeScript definitions
```

---

Code Conventions

· TypeScript Strict Mode: Enforced. No any.
· Import Aliases: Use @/ path aliases.
· Formatting: Double quotes, semicolons, two-space indentations.
· Safeguards: Destructive operations require two-step confirmation modals.

---

Related Documentation

· Platform Office PRD
· Multi-Tenancy PRD
· Project Skill Index

```
.