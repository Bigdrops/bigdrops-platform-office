# Product Requirements Document (PRD)

## Project: BIGDROPS Platform Office (Operations Console)

**Status:** Locked Architecture (Frozen)  
**Date:** 2026-07-15  
**Repository path:** `docs/PRD/platform-office-prd.md`  
**Dependencies:** Multi-Tenancy PRD (v2.1)

---

## 1. Executive Summary

The Platform Office is an independent, high-density Operations Console (NOC) designed exclusively for BIGDROPS platform operators. It is the centralized cockpit used to observe, maintain, and recover the multi-tenant BIGDROPS system.

It is designed as an "Operations OS" rather than a standard admin CRUD panel, prioritizing end-to-end operational workflows, high information density, and strict data isolation.

---

## 2. Fundamental Architectural Boundaries

### 2.1 Application Independence

- **Decoupled Lifecycle**: The Platform Office is a distinct application from the BIGDROPS ERP. It maintains its own independent build, routing, deployment, and release lifecycle.
- **Repository Strategy**: Repository organization (monorepo vs. multi-repo) is an implementation detail. Architecturally, the codebases must remain modular and independently deployable.

### 2.2 Data Isolation (The "No-Cross" Rule)

> **The Isolation Boundary:** The Platform Office is strictly prohibited from peering into tenant-isolated business schemas (e.g., `workspace_xxxx.invoices`, `waybills`, `projects`). It has zero read/write access to tenant business data.

**Explicit Metadata Consumption:** The Platform Office reads and interacts *only* with explicit, platform-wide observability models residing in the `public` schema.

```

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

### 2.3 Principle of Least Privilege

- **Infrastructure-Only Scope**: Platform operators manage workspace existence, provisioning health, and system status. They hold zero authority over, or visibility into, workspace membership, internal team roles, or business-data content.

---

## 3. Operational Domain Contract (Integration Boundary)

The Platform Office communicates with the core multi-tenancy engine exclusively through documented backend contracts in the `public` schema. It relies on the following stable entities:

### 3.1 Provisioning Status (`public.entity_provisioning_status`)

Read-only for the Platform Office. This table is written to by backend provisioning pipelines and polled by the console to assess workspace creation health:

| Field | Type | Description |
|-------|------|-------------|
| `entity_id` | `uuid` (Primary Key) | Unique identifier for the entity |
| `status` | `text` | `pending`, `creating`, `ready`, `failed`, `purging`, `purged` |
| `last_error` | `text` | Most recent error message (if any) |
| `attempt_count` | `integer` | Number of provisioning attempts |
| `updated_at` | `timestamptz` | Last status update timestamp |

### 3.2 Workspace Status (`public.workspaces.status`)

Monitored to track the broad operational state of tenants:

- Supported states: `pending_approval`, `active`, `suspended`, `archived`

### 3.3 Platform Operators (`public.platform_operators`)

Defines role-based platform authority, completely distinct from ERP workspace-level permissions:

- **Enforced role:** `role = 'owner'` (possesses platform orchestration privileges)
- **Reserved roles:** `support`, `auditor`, `operations` (future roles, constrained to `public`-schema read-only tables)

### 3.4 Unified Event Log (`public.activity_events`)

All platform-level operations, security events, and console access logs are written to the shared `public.activity_events` ledger for unified audit capability.

---

## 4. Key Functional Domains & Workflows

### 4.1 Platform Overview (NOC Dashboard)

The "Home Screen" of the application. It acts as an aggregation layer that does not own data, but summarizes all other operational domains:

- **System State Widget**: Live health status of the platform.
- **Orchestration Monitor**: Quick counts of workspaces awaiting approval or experiencing provisioning failures.
- **Active Incidents**: High-priority alert tracker pulling from the `public.platform_incidents` ledger.
- **System Volume Indicators**: Aggregated throughput rates without accessing tenant-specific transaction data.

### 4.2 Lifecycle Orchestration (Workspace Workflows)

Operators manage workspaces via controlled transition events rather than direct row-editing:

- **The Approval Path**: Transitioning a workspace from `pending_approval` to `creating`. Initiates the automated `CREATE SCHEMA` backend pipeline, tracking progress through the `entity_provisioning_status` table.
- **The Lockout Path (Suspension)**: Flipped to instantly lock out a tenant workspace via RLS/global checks at the platform boundary. This is a non-destructive action that leaves business data intact.
- **The Termination Path (Purge/Archive)**: High-impact actions requiring multi-step verification and explicit confirmation to trigger background teardown pipelines safely.

### 4.3 Subscription & Entitlements

- **Status Modeling**: Track billing status decoupled from the actual payment processors (adhering to the deferred "WinRAR model" for MVP).
- **Entitlement Overrides**: Direct administrative ability to override system quotas, limits, or enable specific feature flags for a tenant workspace.

### 4.4 Operator Security & Safe-Action Allowlist

- **Centralized Identity, Bifurcated Auth**: Uses the shared `auth.users` identity pool, but isolates console authorization.
- **MFA Step-Up Gate**: The Platform Office implements its own explicit re-authentication / TOTP challenge at the console entry point, independent of whether the user has an active ERP session.
- **Console Session Policy**: Shorter session timeouts and mandatory inactivity logouts are enforced application-wide.
- **Safe-Action Allowlist**: The console is restricted to calling pre-approved, read-only, or non-destructive diagnostic RPCs (e.g., ping tests, health checks). Executing generic, un-sandboxed backend functions is strictly prohibited.

---

## 5. Out-of-Scope Items (Explicitly Excluded)

The following items are explicitly **excluded** from the Platform Office scope:

1. **Direct Billing Integration**: No live Stripe/payment processor configuration hooks are implemented inside the workspace settings (deferred).
2. **ERP Team Membership**: Operators cannot view individual workspace user accounts, invite workspace staff, or alter granular workspace permissions.
3. **Data Inspection**: The console will never render a client document (Invoice, Waybill, CSR) or search raw transactional records.

---

## 6. Success Criteria

1. **Data Isolation Enforced**: No Platform Office query ever accesses tenant-isolated schemas. All data consumed originates from `public`-schema observability tables.
2. **Workspace Lifecycle Managed**: Operators can approve, suspend, and archive workspaces through controlled transition events.
3. **Provisioning Observability**: Failed provisioning attempts are visible with error details and retry history via `entity_provisioning_status`.
4. **Audit Completeness**: Every operator action (approve, suspend, archive, entitlement change) is recorded in `public.activity_events`.
5. **MFA Step-Up Enforced**: Re-authentication / TOTP challenge is required at console entry, independent of ERP session state.
6. **Safe-Action Allowlist**: Only pre-approved diagnostic RPCs are executable from the console; generic backend function execution is blocked.
7. **Decoupled Lifecycle**: Platform Office and ERP applications can be built, deployed, and released independently.
8. **No Business Data Access**: Platform operators never see client names, document numbers, or transaction amounts from tenant schemas.

---

## 7. Dependencies & Open Items

### 7.1 Upstream Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| `entity_provisioning_status` table | Multi-Tenancy Team | Implemented |
| `platform_operators` table | Multi-Tenancy Team | Implemented |
| `workspaces` table (status field) | Multi-Tenancy Team | Implemented |
| Platform Owner role provisioning | Multi-Tenancy Team | Planned |
| `public.activity_events` for audit | Audit Team | Implemented |

### 7.2 Open Items

- **Platform Incidents Table**: `public.platform_incidents` is referenced in the NOC Dashboard but not yet defined. This should be implemented by the Platform Office team as a `public`-schema table, following the same observability contract pattern.
- **Console Session Management**: Implementation of shorter timeouts and inactivity logout policies.
- **MFA Step-Up Integration**: TOTP challenge implementation at console entry point.

---

## 8. Integration Contract Summary

| Consumer | Producer | Data Exchanged | Direction |
|----------|----------|----------------|-----------|
| Platform Office | Multi-Tenancy Engine | `entity_provisioning_status` | Read-only |
| Platform Office | Multi-Tenancy Engine | `workspaces.status` | Read-only |
| Platform Office | Multi-Tenancy Engine | `platform_operators` | Read-only |
| Platform Office | Multi-Tenancy Engine | `workspace_approval` mutation | Write (via RPC) |
| Platform Office | Platform Office (self) | `activity_events` | Write |

---

## 9. Document Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-15 | Platform Office Team | Initial locked architecture |

---

This document represents the absolute source of truth for the Platform Office workstream, incorporating the security guardrails, the structural boundaries, and the integration contract agreed upon with the multi-tenancy team.
```