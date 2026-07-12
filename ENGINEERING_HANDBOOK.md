# ENGINEERING_HANDBOOK.md

Version: 0.2

Approved By: David Taylor

Approved Date: 2026-07-12

---

# Purpose

The Engineering Handbook defines the standard engineering workflow used throughout Taylor Creative Development.

It explains how projects progress from an initial idea through planning, implementation, testing, release, and maintenance while maintaining consistency across all production projects.

The handbook complements the Core Principles by describing *how* work is performed while the Core Principles define the enduring values that guide the work.

---

# Engineering Philosophy

Taylor Creative Development follows an engineering methodology centered around thoughtful planning, disciplined implementation, continuous discovery, and deliberate iteration.

Projects evolve through discovery.

Core Principles guide decisions.

Engineering standards provide consistency.

The Project Owner provides vision.

Engineering exists to support that vision.

---

# Standard Project Lifecycle

Every production project follows the same high-level lifecycle.

1. Project Discovery
2. Project Definition
3. Repository Creation
4. Engineering Planning
5. Implementation
6. Review
7. Quality Assurance
8. Release
9. Maintenance

Projects may move backward when discovery reveals new information.

---

# Repository Creation

Production repositories are created from the Taylor Creative Development Standards Template Repository.

Each new repository inherits the current Core Principles, engineering standards, and project templates.

---

# Required Project Documents

Every production repository should contain:

- PROJECT_CHARTER.md
- PROJECT_STATUS.md
- CORE_PRINCIPLES.md
- ROLE_ASSIGNMENTS.md
- ENGINEERING_HANDBOOK.md
- AGENTS.md
- README.md

Additional documentation may be added as needed.

---

# Project Startup Workflow

Before implementation planning begins:

1. Create the repository.
2. Complete PROJECT_CHARTER.md.
3. Review Core Principles.
4. Review Role Assignments.
5. Create initial GitHub Issues.
6. Complete PROJECT_STATUS.md.
7. Configure AGENTS.md.
8. Begin implementation planning.

---

# Beginning Any Engineering Session

Before performing engineering work:

1. Read PROJECT_STATUS.md.
2. Review assigned GitHub Issue(s).
3. Review PROJECT_CHARTER.md if strategic context is needed.
4. Review CORE_PRINCIPLES.md when product, user, business, or engineering judgment is required.
5. Review other documentation as required.
6. Confirm project scope.
7. Begin assigned work.

No implementation should begin without understanding the current project state.

---

# GitHub Issues

GitHub Issues are the authoritative source for implementation work.

Every meaningful implementation task should exist as either:

- an Issue, or
- a sub-issue.

Issue documentation should clearly define:

- purpose
- requirements
- acceptance criteria
- dependencies
- testing expectations

Implementation details belong in GitHub Issues—not in the Project Charter.

---

# Engineering Workflow

Typical implementation follows this sequence:

1. Review documentation.
2. Review GitHub Issue.
3. Produce implementation plan when appropriate.
4. Implement.
5. Verify.
6. Update documentation.
7. QA Review.
8. Project Owner approval.
9. Close GitHub Issue.

Not every issue requires every step.

Engineering judgment should always be applied.

---

# Discovery During Implementation

Implementation frequently reveals new information.

When implementation uncovers valuable work outside the approved scope:

- Pause.
- Document the recommendation.
- Present it to the Project Owner.
- Await approval.

The Project Owner may grant temporary implementation authority when appropriate.

---

# Documentation Standards

Unless otherwise specified:

All engineering documentation should be written in Markdown.

Documentation should remain concise, accurate, and useful.

Documentation should explain decisions rather than duplicate implementation details.

---

# AI Engineering Agents

AI engineering agents are members of the engineering team.

They assist with:

- planning
- documentation
- implementation
- review
- analysis

AI agents do not determine project direction.

Authority remains with the Project Owner.

---

# Quality Assurance

Completed implementation should be reviewed before acceptance.

QA should verify:

- requirements
- expected behavior
- regressions
- usability
- alignment with the Core Principles
- project standards

---

# Engineering Standards

Engineering standards are intended to remain stable.

Standards evolve through practical experience rather than theory.

Changes should be deliberate and approved by the Project Owner.

---

# Continuous Improvement

Taylor Creative Development continuously improves both its software and its engineering methodology.

Lessons learned from projects should improve future projects through thoughtful refinement of the Core Principles and engineering standards.
