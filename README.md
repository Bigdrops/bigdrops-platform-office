# BIGDROPS Platform Office (Admin) 🏢

This repository contains the **BIGDROPS Platform Office**, a dedicated internal administration application for operating and managing the BIGDROPS SaaS platform. 

It is designed as an isolated SaaS control plane, running independently of the core customer-facing ERP client application.

---

## 📐 Architectural Separation of Concerns

The Platform Office and ERP are separate frontend applications that share the same Supabase backend and authentication system while maintaining strict isolation of responsibilities.


```
┌────────────────────────────────────────┐
│         Shared Supabase Backend        │
│  (Unified Auth, RLS, DB Schema, RPCs)  │
└───────────────────┬────────────────────┘
│
┌────────────────┴────────────────┐
▼                                 ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│      ERP Application     │      │     Platform Office      │
│  https://bigdrops.app    │      │  https://admin.bigdrops  │
│                          │      │                          │
│ 🛠️ Customer Business     │      │ ⚙️ Platform Operations    │
│  - Workspaces / Tenants  │      │  - Workspace Governance  │
│  - Daily Business Flows  │      │  - Support Diagnostics   │
│  - Document Management   │      │  - Operational Metrics   │
└──────────────────────────┘      └──────────────────────────┘
```

---

## 🎯 Core Responsibilities

- **Workspace Lifecycle:** Approval, suspension, restoration, archival, diagnostics, and purge workflows.
- **Platform Users:** Managing administrative roles, support operators, and user lookup.
- **Support Tooling:** Access inspection, entity diagnostics, activity logs, and permission checks.
- **Feature Management:** Administering feature flags, gradual rollouts, and beta programs.
- **System Monitoring:** Background queue health, storage metrics, and API latency charts.
- **Audit Center:** Administrative actions, security logs, and approval histories.

---

## 🛠️ Technology Stack & Dev Workflow

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS & Shadcn UI
- **State Management:** Zustand & React Query
- **Package Manager / Runtime:** [Bun](https://bun.sh/) 🚀

### Getting Started

Ensure you have [Bun installed](https://bun.sh/).

1. **Install dependencies (at lightning speed):**
   ```bash
   bun install

```
 2. **Run the development server:**
   ```bash
   bun dev
   
   ```
 3. **Production Build:**
   ```bash
   bun run build
   
   ```
## 🔒 Security & Backend Enforcement
 1. **Authentication:** Shares the core Supabase authentication system (Single Identity plane).
 2. **Authorization:** Access is determined strictly via backend verification (Custom JWT User Claims or DB role mappings). The frontend is *never* the single source of truth for administrative authorization.
 3. **Operational Safeguards:** Destructive platform operations are locked behind explicit two-step confirmation modals, soft-delete rules, and recovery windows.
```

---

