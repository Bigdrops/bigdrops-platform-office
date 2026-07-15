# Product Requirements Document: BIGDROPS Platform Office

## 1. Executive Summary
The Platform Office is an independent Operations Console (NOC) designed exclusively for BIGDROPS platform operators. It is the control plane for observing, maintaining, and recovering the multi-tenant system. It is a first-class application in the BIGDROPS ecosystem, architecturally and operationally decoupled from the ERP.

## 2. Guiding Principles
- **Operations-First**: Every screen must facilitate observation, diagnosis, or action.
- **Backend-Agnostic**: UI architecture is based on operational domains, not specific SQL schemas or RPC signatures.
- **High Information Density**: Optimized for experienced system operators; prioritization of scanability over whitespace.
- **Safety Over Speed**: High-impact actions require deliberate confirmation, multi-step verification, and traceability.
- **Observability by Default**: All significant platform mutations are logged and explainable.
- **Workflow-Oriented**: Navigation and modules are defined by operational journeys (e.g., "Resolve Provisioning Failure"), not CRUD resource management.

## 3. Operational Domain & Architecture
- **Application Independence**: The Platform Office maintains an independent deployment, release lifecycle, and operational responsibility. Repository organization (monorepo vs. multi-repo) is an implementation decision.
- **Identity & Auth**:
    - **Shared Identity**: Uses the central `auth.users` pool for consistent auditability.
    - **Independent Authorization**: Platform authorization (roles, scopes, permissions) is distinct from ERP workspace roles.
    - **Security Policy**: Independent session policies, mandatory MFA, shorter timeouts, and comprehensive audit logging for all platform-level access.
- **Operational Data**: The Platform Office consumes an "Operational Domain" (state and events). It must not query or peer into tenant-isolated business schemas.

## 4. Key Modules
1. **Platform Overview (NOC)**: 
    - Entry point for all operators.
    - Aggregates status across operational domains (Provisioning, Alerts, Incidents, Lifecycle, Jobs).
2. **Provisioning & Orchestration**: 
    - Observes tenant lifecycle states.
    - Provides diagnostic tools for stuck or failed provisioning processes.
3. **Incident Response**: 
    - Centralized ledger of system-wide and tenant-specific incidents.
    - Provides recovery workflows and state-management tools.
4. **Audit & Diagnostics**: 
    - System-wide event ledger and anomaly detection.
5. **Operator Toolkit**: 
    - Global utilities (Search, Workspace lookup, Safe-Action Allowlist, Feature Flag explorer).

## 5. Security & Isolation Constraints
- **Least Privilege**: Platform operators have zero visibility into workspace members, entity-specific business data, or permission structures. 
- **Blast Radius**: Platform Office functionality is restricted to platform lifecycle and system health monitoring.
- **RPC Safety**: Only pre-approved, purpose-built diagnostic or recovery RPCs are exposed via a "Safe-Action Allowlist." Generic or high-privilege functions are prohibited.

## 6. Implementation Notes
- **Communication Protocol**: Operational state should be made explicit through dedicated observability models (e.g., provisioning status trackers, incident tables) rather than inferred from ERP business tables.
- **Auditing**: All platform-level access and sensitive operations must be recorded in the shared `public.activity_events` ledger for unified observability.
