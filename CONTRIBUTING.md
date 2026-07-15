# Contributing to BIGDROPS Platform Office

Thank you for contributing to the **BIGDROPS Platform Office** (repo: `bigdrops-platform-office`). 

This console serves as the critical operations cockpit (NOC) for the entire BIGDROPS ecosystem. Because this application operates with high-level administrative permissions over platform state, all contributions must adhere to strict security, architectural, and quality standards.

---

## Table of Contents

- [Architectural Guardrails](#architectural-guardrails)
- [Project Layout](#project-layout)
- [Getting Started](#getting-started)
- [Contribution Flow](#contribution-flow)
- [Code Guidelines](#code-guidelines)
- [Pull Request Requirements](#pull-request-requirements)

---

## Architectural Guardrails

Before writing any code, you must understand and respect the boundaries defined in the product architecture:

1. **The "No-Cross" Data Isolation Rule:** Under no circumstances should this application attempt to query or interact with tenant-specific schemas (`workspace_xxxx`). All data consumption must go through the explicit observability models in the `public` schema.
2. **Bifurcated Authorization:** Platform permissions must be managed strictly through roles in `public.platform_operators` (e.g., checking if the user matches `role = 'owner'`). Never mix platform admin roles with ERP-level workspace-specific member roles.
3. **Safe-Action Allowlist:** Do not implement direct database execution commands. All mutating operations, retries, and lifecycle state changes must invoke pre-approved, non-destructive diagnostic or orchestration RPCs.

---

## Project Layout

We use a co-location-based file system. Features should keep their page declarations, components, and schema definitions close together inside the route directory.


```
src/
├── app/
│   ├── (auth)/                  # Login and MFA step-up routes
│   └── (dashboard)/             # Main layout and console screens
│       ├── overview/            # NOC Platform Overview
│       ├── provisioning/        # Workspace lifecycle management
│       │   ├── _components/     # Screen-specific nested components
│       │   └── page.tsx         # Route entry point
│       └── incidents/           # Platform incident tracking
├── components/                  # Shared UI components
│   └── ui/                      # Local shadcn components
├── hooks/                       # Shared custom React hooks
├── lib/                         # Configuration & global utilities
├── styles/                      # Tailwind and global styles
├── supabase/                    # Client client configuration and types
└── types/                       # Shared TypeScript definitions
```

---

## Getting Started

### Fork and Clone the Repository

1. Fork the repository on your Git hosting provider.
2. Clone your fork locally:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/bigdrops-platform-office.git](https://github.com/YOUR_USERNAME/bigdrops-platform-office.git)

```
 3. Navigate into the project directory:
   ```bash
   cd bigdrops-platform-office
   
   ```
### Installation and Running
This project uses **Bun** as its package manager and runtime. Do not use npm, yarn, or pnpm.
 1. **Install dependencies:**
   ```bash
   bun install
   
   ```
 2. **Configure Environment Variables:**
   Create a .env.local file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   
   ```
 3. **Run the development server:**
   ```bash
   bun dev
   
   ```
   The application will be available locally at http://localhost:3000.
## Contribution Flow
 1. **Create a Feature Branch:**
   Always branch off main using clear, semantic naming:
   ```bash
   git checkout -b feature/provisioning-retry-button
   
   ```
 2. **Format and Lint:**
   Run checks locally before staging files to ensure code quality:
   ```bash
   bun run lint
   
   ```
 3. **Commit Your Work:**
   Use clear, conventional commit prefixes (feat:, fix:, docs:, refactor:, chore:):
   ```bash
   git commit -m "feat: add retry provisioning workflow to console"
   
   ```
## Code Guidelines
 * **TypeScript Strict Mode:** Enforced. Avoid using any types. Provide explicit definitions for database entities and operational states.
 * **Density Over Spacing:** This is a professional operations workspace. Keep margins, padding, and text hierarchies compact. Optimize data tables and logs to display maximum information without vertical bloat.
 * **Defensive UI State Handling:** Always handle loading, empty, and failed network states gracefully using React Suspense, skeleton loaders, and descriptive error banners.
 * **Accessibility (a11y):** All UI components must support keyboard navigation, visible focus states, and correct ARIA attributes.
 * **Safeguarded Actions:** Any state-changing action (suspending a workspace, purging data, re-triggering schema builds) must be wrapped in a two-step confirmation modal requiring deliberate user interaction.
## Pull Request Requirements
When submitting a Pull Request (PR):
 1. Ensure your branch is fully rebased on the latest main branch.
 2. Include a detailed description of the changes made and the operational problem they resolve.
 3. Attach screenshots or screen recordings showing your changes in both light and dark themes.
 4. If your PR modifies state-changing operations, detail the verification steps you performed to ensure the action complies with the Safe-Action Allowlist.
```

```
