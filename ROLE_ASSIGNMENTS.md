# ROLE_ASSIGNMENTS.md

Version: 0.1

Approved By: David Taylor

Approved Date: 2026-07-06

---

# Purpose

This document defines the standard engineering roles used throughout Taylor Creative Development.

Roles exist to clarify responsibility, authority, accountability, and collaboration. They are intended to improve engineering quality and efficiency—not introduce unnecessary bureaucracy.

One individual or AI engineering agent may fulfill multiple roles on a project. Role assignment does not transfer project ownership. Final authority remains with the Project Owner unless explicitly delegated.

---

# 1. Project Owner

## Purpose

The Project Owner is responsible for the overall success of the project and owns its vision, priorities, scope, and final decisions.

## Typical Assignee

Project Owner

## Responsibilities

- Define the project vision.
- Approve the Project Charter.
- Establish priorities.
- Approve or reject scope changes.
- Approve engineering standards.
- Approve releases.
- Accept or reject completed work.
- Resolve conflicts.
- Delegate authority when appropriate.

## Authority

The Project Owner has final authority over all project decisions.

Authority may be delegated for specific tasks but remains the responsibility of the Project Owner.

---

# 2. Engineering Strategist

## Purpose

The Engineering Strategist partners with the Project Owner to transform ideas into organized engineering work while preserving the project's vision.

## Typical Assignee

Assigned AI Engineering Agent

## Responsibilities

- Capture and organize ideas.
- Synthesize brainstorming sessions.
- Draft documentation.
- Refine requirements.
- Identify risks and dependencies.
- Challenge assumptions constructively.
- Review engineering work for consistency.
- Convert validated ideas into actionable GitHub Issues.
- Maintain alignment across project documentation.

## Authority

Advisory only.

The Engineering Strategist recommends, organizes, and reviews but does not make project decisions.

---

# 3. Solution Architect

## Purpose

Design technical implementation approaches for approved work.

## Typical Assignee

Assigned AI Engineering Agent

## Responsibilities

- Review required project documentation.
- Produce implementation plans.
- Recommend technical approaches.
- Identify dependencies.
- Identify risks.
- Recommend implementation sequencing.
- Escalate unclear requirements before implementation.

## Authority

May recommend implementation strategies and architectural approaches.

May not alter project direction or begin implementation without authorization.

---

# 4. Implementation Engineer

## Purpose

Execute approved engineering work.

## Typical Assignee

Assigned Human Engineer or Assigned AI Engineering Agent

## Responsibilities

- Review required project documentation before beginning work.
- Implement assigned GitHub Issues.
- Follow engineering standards.
- Remain within approved scope.
- Preserve approved project architecture.
- Document implementation decisions when appropriate.
- Report blockers immediately.
- Complete required verification.
- Update documentation when required by the assigned issue.

## Authority

The Implementation Engineer may make routine implementation decisions necessary to complete the assigned work.

The Implementation Engineer may **not**:

- Expand the approved scope of an assigned GitHub Issue.
- Alter project direction.
- Introduce significant architectural changes.
- Implement additional functionality outside the approved scope without authorization.

If, during implementation, the engineer discovers work outside the approved scope that would materially improve the implementation, the engineer should:

1. Pause implementation.
2. Document the proposed change and the reasoning behind it.
3. Present the recommendation to the Project Owner or delegated authority.
4. Await a decision before proceeding.

The Project Owner or delegated authority may grant **temporary implementation authority** to complete the additional work without requiring the normal planning workflow.

This delegated authority:

- Applies only to the specifically approved work.
- Is limited to the current implementation effort.
- May be revoked at any time.
- Does not transfer standing authority.
- Does not authorize unrelated scope expansion.

---

# 5. QA Reviewer

## Purpose

Validate that completed work satisfies the approved requirements and behaves as intended.

## Typical Assignee

Assigned Human Reviewer

## Responsibilities

- Test completed work.
- Verify acceptance criteria.
- Identify regressions.
- Confirm expected behavior.
- Recommend acceptance or rejection.
- Report defects.

## Authority

May approve or reject completed work for QA purposes.

Release approval remains with the Project Owner.

---

# 6. Documentation Maintainer

## Purpose

Maintain accurate, useful, and current project documentation.

## Typical Assignee

Assigned Human Engineer or Assigned AI Engineering Agent

## Responsibilities

- Update project documentation.
- Maintain Project Status.
- Record important project decisions.
- Ensure documentation remains synchronized with the project.
- Follow documentation standards.

## Authority

May update documentation within assigned responsibilities.

May not change project direction or engineering standards without approval.

---

# 7. Standards Maintainer

## Purpose

Maintain the Taylor Creative Development Engineering Standards.

## Typical Assignee

Project Owner

## Responsibilities

- Review proposed standards revisions.
- Maintain consistency across standards.
- Improve standards through practical experience.
- Prevent unnecessary bureaucracy.
- Maintain document versioning and approvals.

## Authority

Engineering standards may only be revised through deliberate review and Project Owner approval.

---

# Role Assignment Rules

## Multiple Roles

One individual or AI engineering agent may fulfill multiple roles.

Holding multiple roles does not grant additional authority beyond those roles.

---

## Assignment

Roles are assigned according to the needs of the project and may change throughout the project lifecycle.

Assignments are independent of the tools used to perform the work.

---

## Authority

Responsibility follows the assigned role.

Authority remains with the Project Owner unless explicitly delegated for a specific purpose.

Delegated authority is temporary, limited in scope, and revocable.

---

# Guiding Principle

Roles exist to improve communication, accountability, collaboration, and engineering quality.

Every role should make the project easier to understand, easier to execute, and easier to maintain.

If a role no longer provides meaningful value, it should be reevaluated.
