I completely agree. Your version captures the core intent perfectly.
By stripping away the prescriptive implementation steps and keeping the prompt focused on the **what** and the **why**, we allow the agent to do what it is actually built for: auditing the real code, discovering the physical import paths, and validating the current state of the repository.
Here is the finalized, highly intent-driven prompt, optimized with clean layout structure and ready to hand off to the implementation agent.
### 📋 Task: Generate the Canonical Platform Office Migration Roadmap
Read AGENTS.md at the root of the repository and follow all investigation and Reports Protocol requirements.
#### Document Precedence Hierarchy
 1. **AGENTS.md** (Highest)
 2. **Platform Office PRD** (including approved amendments)
 3. **Existing repository reports**
 4. **Multi-Tenancy PRD** (Context only)
> **Scope Guardrail:** The Multi-Tenancy PRD must not influence implementation scope unless explicitly required by the Platform Office PRD. Multi-tenancy items belong *only* in a "Future Considerations" section.
> 
### Objective
Using the Platform Office PRD and the current repository state, generate the canonical dependency-driven migration roadmap.
This roadmap must be derived from actual repository structure and dependencies, not generic migration patterns or assumptions.
### Requirements
The roadmap must include:
 * **Repository-Derived Dependency Graph:** A map of actual code and import relationships on disk (not a conceptual or layered flow).
 * **Critical Implementation Path:** The logical progression of work from core foundation to completed migration.
 * **Dependency-Unlock Sequencing:** Phase-by-phase implementation sequencing based on what each step unlocks rather than abstract feature grouping.
 * **Comprehensive Phase Breakdown:** For every phase, document:
   * Objective
   * Repository evidence (physical files/folders)
   * PRD traceability
   * Entry & Exit criteria
   * Dependencies on previous phases
   * Risks & mitigation strategies
   * Implementation unlocks (What does this phase enable next?)
 * **Compile-Safe Checkpoints:** Explicit validation gates throughout the migration process where the project must cleanly compile and run.
 * **Cross-Cutting Mobile Integration:** Mobile-first design considerations (touch targets, responsive behavior, drawer/dialog degradation) integrated into *every* applicable phase, rather than isolated into a separate step.
 * **Two-Stage Cleanup Strategy:**
   * An *early decommissioning strategy* to remove dead/orphaned routes and templates.
   * A separate *late optimization strategy* to safely prune third-party dependencies from package.json once feature stability is verified.
 * **Future Considerations:** A dedicated section capturing future architectural items from the Multi-Tenancy PRD that are out-of-scope for this phase of the migration.
### Execution Constraints
 * Ground every single recommendation in physical repository evidence.
 * **Do not modify application source code.** This is an investigation and planning task only.
 * Generate the final markdown report under:
   docs/Reports/migration/platform-office-migration-roadmap3.md
