# BIGDROPS Platform Office (Admin)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Bun](https://img.shields.io/badge/Bun-1.0-white?style=flat-square&logo=bun&logoColor=black)](https://bun.sh/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)](LICENSE)

---

## Overview

This repository contains the **BIGDROPS Platform Office** — a dedicated, high-density Operations Console (NOC) for managing and operating the multi-tenant BIGDROPS SaaS engine.

It is designed as an isolated **SaaS control plane**, running independently of the core customer-facing ERP client application, sharing only the underlying Supabase backend and authentication pool while enforcing strict data segregation.

---

## Table of Contents

- [Architectural Separation of Concerns](#architectural-separation-of-concerns)
- [Core Responsibilities](#core-responsibilities)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Security & Operator Safeguards](#security--operator-safeguards)
- [License](#license)

---

## Architectural Separation of Concerns

The Platform Office and the ERP are separate frontend applications that share the same Supabase backend database and authentication pool, but enforce complete segregation of operational duties and data visibility.


```
┌──────────────────────────────┐
│     BIGDROPS ECOSYSTEM       │
└──────────────┬───────────────┘
│
Shared Supabase Database Instance
│
┌──────────────────────┴──────────────────────┐
▼                                             ▼
[public] Schema Only                          [tenant] Isolated Schemas
• public.workspaces                           • workspace_acme.invoices
• public.platform_operators                   • workspace_beta.waybills
• public.entity_provisioning_status           • workspace_gamma.projects
│                                             │
▼                                             ▼
┌───────────────────────┐                     ┌───────────────────────┐
│    PLATFORM OFFICE    │                     │     BIGDROPS ERP      │
│ (Operations Console)  │                     │   (Business App)      │
└───────────────────────┘                     └───────────────────────┘
```

### The "No-Cross" Data Isolation Rule
The Platform Office is strictly prohibited from peering into tenant-isolated business schemas (`workspace_xxxx`). It has zero read/write access to tenant transaction records (e.g., invoices, waybills, projects, or documents). Instead, it consumes and operates solely on explicit, high-level operational metadata residing inside the shared `public` schema.

---

## Core Responsibilities

- **Workspace Lifecycle State Machine:** Orchestrating workspace status transitions (`Requested` -> `AwaitingApproval` -> `Provisioning` -> `Active` -> `Suspended` -> `Archived` -> `Purged`) via immutable background commands rather than direct row mutations.
- **Platform Authorization & Roles:** Managing administrative platform access through `public.platform_operators` permissions (e.g., Owner, Support, Auditor), decoupled from internal ERP workspace roles.
- **Observability & Diagnostics:** Polling the automated `public.entity_provisioning_status` ledger to monitor backend schema migrations, provisioning health, and infrastructure pipelines.
- **Feature Management:** Administering global feature flags, workspace quota overrides, and plan entitlements without interacting with local billing systems.
- **Security Audit Center:** Writing and reviewing console access logs, operator authentication anomalies, and major state transitions inside the unified `public.activity_events` ledger.

---

## Technology Stack

The console is built using high-performance, modern web technologies designed to render high-density real-time tables and charts efficiently:

- **Framework:** Next.js 15 (App Router, React Server Components)
- **Styling:** Tailwind CSS & Shadcn UI (Radix Primitives)
- **State Management:** Zustand (Client-side Config) & React Query (Server Cache Synchronization)
- **Runtime & Package Manager:** Bun 

---

## Getting Started

Ensure you have Bun installed on your machine.

### 1. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

```
### 2. Installation & Run commands
```bash
# Install dependencies
bun install

# Run the local development server
bun dev

# Build the production optimized bundle
bun run build

# Preview the production build locally
bun start

```
## Security & Operator Safeguards
Because this app acts as the system control plane, we implement strict mitigation features to prevent operator errors and identity takeover:
 1. **Bifurcated Authorization:** This console is governed strictly by custom backend roles in public.platform_operators. Frontend code is never the source of authorization truth.
 2. **MFA Step-Up Gate:** The Platform Office enforces its own mandatory, application-level Time-based One-Time Password (TOTP) re-authentication check upon operator login, independent of standard ERP active sessions.
 3. **Operator Session Limits:** Shorter inactivity timeouts and automatic session termination are strictly enforced across all dashboard paths.
 4. **Two-Step Confirmations:** Destructive platform operations (such as workspace suspension or database purging) require a dynamic, two-step confirmation modal check paired with a soft-delete recovery window.
## License
This software is proprietary and confidential. Unauthorized copying, distribution, or modifications of this repository via any medium is strictly prohibited.
Copyright © 2026 BIGDROPS Platform. All rights reserved.
```

