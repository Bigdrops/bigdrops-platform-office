====================================================================
PRECONDITION

Read AGENTS.md before commencing this task. All applicable protocols and standards defined therein must be observed throughout this work.

====================================================================

## Objective

Perform a comprehensive Template Decontamination and Mobile UX Hardening pass across the BIGDROPS Platform Office codebase.

This project originated from the `next-shadcn-admin-dashboard` template. Before further feature development, remove all remaining template artifacts, establish consistent BIGDROPS Platform Office branding, and improve the mobile navigation experience.

## Required Skills

Read `docs/ProjectSkillIndex.md` and load the following skills before beginning:

- karpathy-guidelines
- next-best-practices
- react-best-practices
- shadcn
- tailwind-css-patterns
- typescript-advanced-types
- ponytail

---

## Scope

### 1. Repository-Wide Template Audit

Perform a complete audit for any artifacts inherited from the original template repository.

Audit for:

- Arham Khan
- arhamkhnz
- next-shadcn-admin-dashboard
- Template branding
- Demo branding
- Demo avatars
- Demo users
- Demo emails
- Demo URLs
- GitHub links
- X/Twitter links
- Repository references
- Placeholder metadata
- Placeholder descriptions
- Example content
- Any other starter-template artifacts that do not belong to BIGDROPS Platform Office

Search for values including (but not limited to):

- Arham
- arham
- arhamkhnz
- next-shadcn-admin-dashboard
- github.com/arhamkhnz
- twitter.com
- x.com
- demo
- example@
- placeholder

Replace or remove these artifacts as appropriate.

If a section exists solely to advertise the template author, repository, or social accounts, remove it entirely rather than replacing it with additional placeholder content.

---

### 2. Platform Branding

Ensure all visible branding is consistent with BIGDROPS Platform Office.

Do not introduce fake users, fake email addresses, fake social links, or generic placeholder information.

Where legitimate Platform Office content does not yet exist, prefer removing the unnecessary UI section rather than inventing replacement content.

Audit:

- sidebar
- navigation
- footer
- user profile areas
- metadata
- application title
- descriptions
- logos
- icons
- empty states
- about/help sections

for consistency.

---

### 3. Mobile Navigation UX Hardening

Audit the mobile sidebar/drawer implementation.

The current behaviour leaves the navigation drawer open after a user selects a destination, resulting in unnecessary interaction before the destination page becomes visible.

Improve the navigation experience so that:

- the drawer automatically dismisses after successful navigation
- the destination page is immediately visible
- the active navigation item is correctly highlighted
- navigation feels natural on mobile devices
- no hover-dependent behaviour exists

Implement this using the existing project architecture rather than forcing a specific implementation.

---

### 4. UI Consistency Review

While auditing the affected components, identify any remaining template-era UI inconsistencies within the same scope.

Examples include:

- inconsistent naming
- outdated labels
- template wording
- unnecessary demo widgets
- leftover placeholder content
- visual inconsistencies introduced by the starter template

Make only minimal, targeted improvements that align the interface with BIGDROPS Platform Office.

Do not perform unrelated redesigns or refactors.

---

## Constraints

- Preserve existing application behaviour except where modified by this task.
- Keep changes minimal and well-scoped.
- Do not introduce unnecessary abstractions.
- Follow the existing design system.
- Maintain mobile-first behaviour.
- Do not add placeholder branding or fake data.
- Do not modify unrelated features.

---

## Verification

- Run `bun run typecheck`.
- Verify that all template branding has been removed or replaced.
- Verify the mobile navigation drawer closes automatically after successful navigation.
- Verify the active navigation state updates correctly.
- Verify only the intended files were modified using `git status`.

---

## Acceptance Criteria

- No template or demo branding remains anywhere in the application.
- No references to the original template repository or author remain.
- BIGDROPS Platform Office branding is consistent throughout the application.
- No placeholder personal information or social links remain.
- Mobile navigation behaves like a polished native application.
- Active navigation state remains correct after route changes.
- `bun run typecheck` passes successfully.
- `git status` confirms only the intended files were modified.
- A report is written under the appropriate `docs/Reports/` directory documenting:
  - audit findings
  - changes made
  - remaining issues (if any)
  - verification performed
```