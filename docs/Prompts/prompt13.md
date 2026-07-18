====================================================================
PRECONDITION

Read AGENTS.md before commencing this task. All applicable protocols and standards defined therein must be observed throughout this work.

====================================================================

## Objective

Create the **Milestone 5 – Phase A: Provisioning Foundation** implementation plan. This phase is an architectural foundation exercise—not a UI implementation task. The goal is to define Provisioning as a first-class platform capability with a complete domain specification before any implementation begins.

## Skills Required

Before beginning, read `docs/ProjectSkillIndex.md` and load the following skills:

- karpathy-guidelines
- typescript-advanced-types
- supabase-postgres-best-practices
- auth-implementation-patterns
- audit-logging
- next-best-practices
- ponytail

## Deliverable

Create:

`docs/superpowers/plans/2026-07-17_provisioning-foundation.md`

The document should be an implementation plan using the same structure and quality as the existing project implementation plans.

## Required Content

### 1. Domain-First Architecture

Structure the implementation in this order:

1. Domain Model
2. State Machine
3. Transition Rules
4. Operational Invariants
5. Authorization Model
6. Operational Metadata
7. RPC Contract Specification
8. Service Layer Implementation
9. Verification

The domain must drive the backend contract—not the reverse.

---

### 2. Separate Specification From Implementation

Clearly distinguish between:

**Specification**

- Domain models
- State machine
- Transition rules
- Authorization rules
- Operational metadata
- RPC contract

and

**Implementation**

- TypeScript domain types
- Service wrappers
- RPC integration
- Validation

Implementation should follow the approved specification rather than designing while coding.

---

### 3. Domain Model

Define at minimum:

- ProvisioningRequest
- ProvisioningJob
- ProvisioningStage
- ProvisioningFailure
- ProvisioningTarget
- ProvisioningAction

The design should remain extensible for future provisioning targets rather than assuming workspace-only provisioning.

---

### 4. State Machine

Define the complete provisioning lifecycle:

- Requested → Queued
- Queued → Provisioning
- Provisioning → Succeeded
- Provisioning → Failed
- Failed → Queued (Retry)
- Requested → Cancelled
- Queued → Cancelled

Document both legal and forbidden transitions.

---

### 5. Operational Invariants

Include a dedicated section defining rules such as:

- Provisioning jobs are append-only.
- Completed jobs are immutable.
- Cancelled jobs cannot be retried.
- Only one active provisioning job may exist for the same target.
- Every provisioning request has a stable correlation ID.
- Every transition emits an audit event.
- Retry increments the attempt counter.
- Failure history is preserved.
- Authorization is enforced exclusively through Platform Office rules.
- Service wrappers remain thin and contain no business logic.

---

### 6. Operational Metadata

Define the metadata required for every provisioning request:

- Correlation ID
- Request ID
- Requested By
- Current Owner
- Completed By
- Requested At
- Started At
- Completed At
- Retry Count
- Failure Reason
- Failure Code

This metadata should support auditing, debugging, monitoring, incident response, and future dashboards.

---

### 7. RPC Contract Specification

Define the provisioning RPC contracts at the architectural level.

Specify:

- required inputs
- expected outputs
- authorization requirements
- validation rules
- idempotency expectations
- failure semantics

Do **not** hardcode SQL function signatures. Those should be derived later from the approved domain model.

---

### 8. Idempotency & Concurrency

Add a dedicated section covering:

- duplicate request handling
- concurrent provisioning protection
- retry behaviour
- idempotent operations
- ownership transfer rules where applicable

These requirements should be defined before implementation begins.

---

### 9. Service Layer

The plan should require an audit of the existing service layer before introducing any new abstractions.

- If the project consistently uses `Promise<boolean>`, preserve that convention.
- If a shared `ServiceResult<T>` abstraction already exists project-wide, adopt it consistently.
- Do not introduce a new abstraction solely for this milestone.

---

### 10. Verification

The implementation plan should include verification for:

- state machine completeness
- transition validation
- operational invariant compliance
- authorization compliance
- audit event coverage
- idempotency validation
- type safety

Do not include build commands, commit steps, or repository management instructions in this planning document.

## Expected Outcome

The completed plan should establish Provisioning as a reusable platform capability with a well-defined architectural foundation. After Phase A is implemented, Phase B should primarily focus on building the operator console on top of this established domain model rather than continuing architectural design.