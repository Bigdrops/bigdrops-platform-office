# Product Requirements Document: BIGDROPS Platform Office

## 1. Executive Summary
The Platform Office is an independent, high-density Operations Console (NOC) designed exclusively for BIGDROPS platform operators. It is the centralized control plane for observing, maintaining, and recovering the multi-tenant BIGDROPS system. 

## 2. Architectural Boundaries & Principles
- **Application Independence**: The Platform Office is a distinct application from the BIGDROPS ERP. It maintains its own independent build, deployment, and release lifecycle.
- **Data Isolation (The "No-Cross" Rule)**: 
    - The Platform Office is strictly prohibited from querying tenant-isolated business schemas (e.g., `invoices`, `waybills`, `projects`).
    - All operational data is consumed from explicit, platform-wide observability models (State tables/Event streams) residing in the `public` schema.
- **Operations-First**: The UI is an "Operations OS." The primary entry point is the **Platform Overview (NOC)**, which aggregates system-wide health signals.
- **Principle of Least Privilege**: Platform operators manage workspace existence and system health, not workspace membership or business-data content.

## 3. Operational Domain Definitions
The Platform Office manages the platform through four distinct domains:

### A. Lifecycle Orchestration (Provisioning & State)
- **Role**: Manages the workspace lifecycle via a strictly defined state machine (`Requested`, `AwaitingApproval`, `Provisioning`, `Active`, `Suspended`, `Archived`, `Purged`).
- **Mechanism**: Operators trigger "Transition Events." The system validates the transition and executes the associated background pipeline. 
- **Requirement**: No manual editing of rows; only controlled state transitions.

### B. Subscription & Entitlements
- **Role**: Manages workspace-level billing status and feature access.
- **Mechanism**: Subscription state is treated as an explicit platform-managed entity, decoupled from ERP business logic.
- **Capabilities**:
    - Entitlement Overrides: Modify feature flags/quotas per workspace.
    - Lifecycle Management: Manual Pause/Resume/Cancel triggers.
    - Visibility: Proactive churn/renewal monitoring via aggregated dashboard widgets.

### C. Incident & Alert Management
- **Role**: Centralized ledger for system anomalies.
- **Mechanism**: Operators consume a platform-wide incident feed. Incidents are categorized by severity and status (`open`, `acknowledged`, `resolved`).

### D. Identity & Security (Auth Realm)
- **Shared Identity, Bifurcated Auth**: Shares `auth.users` pool for audit integrity but maintains an independent authorization domain.
- **Security Policy**:
    - Mandatory, per-app MFA verification (Step-up auth) required upon entering the Platform Office.
    - Enforced shorter session timeouts for all operator roles.
    - All actions recorded in a platform-wide `activity_events` audit log.

## 4. Key Operational Modules
1. **Platform Overview (NOC)**: Entry point. Aggregates "Operational Health" widgets (Provisioning status, Active Incidents, Subscription health, Platform Metrics).
2. **Provisioning Console**: Workflow engine for approving, suspending, or purging workspaces. Monitors the lifecycle state machine.
3. **Subscription/Billing Manager**: Control plane for entitlements, plan overrides, and renewal oversight.
4. **Incident Response**: Workstation for incident triage, acknowledging, and resolving platform-level alerts.
5. **Operator Toolkit**: Global diagnostics (Search, Feature Flag explorer, Safe-Action Allowlist).

## 5. Security Guardrails
- **Safe-Action Allowlist**: The console may only invoke pre-approved, non-destructive diagnostic/recovery RPCs. Generic or high-privilege execution is prohibited.
- **Blast Radius Mitigation**: Platform Office access is limited to the system infrastructure and lifecycle management. It holds no authority over the content (data/users) contained within a workspace.

## 6. Implementation Contract
- **Explicit State**: System state (Provisioning/Incidents) must be made explicit via `public` tables populated by backend system processes, not inferred through business table introspection.
- **Auditability**: All operator activity (login, state transitions, subscription changes) is captured in `public.activity_events`. No separate logging tables are to be created for platform access logs.
