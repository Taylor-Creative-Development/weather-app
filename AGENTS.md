# AGENTS.md

Version: 0.1
Approved By: David Taylor
Approved Date: 2026-07-12

---

# Purpose

This file defines the required startup and operating workflow for AI engineering agents and contributors working in the Weather App repository.

---

# Required Startup Sequence

Before beginning work:

1. Read `PROJECT_STATUS.md`.
2. Read the assigned GitHub Issue.
3. Review `PROJECT_CHARTER.md` when product scope, strategy, user value, constraints, or direction matter.
4. Review `CORE_PRINCIPLES.md` when product, user, business, or engineering judgment is required.
5. Review `ENGINEERING_HANDBOOK.md` and `ROLE_ASSIGNMENTS.md` as needed.
6. Confirm the work is approved and within scope.

---

# Authority

David Taylor is the Project Owner and final decision maker.

AI engineering agents may organize, recommend, document, research, review, and implement assigned work within approved scope. They may not redefine the product, approve their own strategic recommendations, or expand scope without authorization.

---

# Work Management

- GitHub Issues are authoritative for approved engineering work.
- Every meaningful implementation task must be represented by an Issue or sub-issue.
- Keep `PROJECT_STATUS.md` current when work changes the project's workflow position.
- Preserve the distinction between approved decisions, recommendations, assumptions, and unresolved questions.
- Pause and escalate when new information would materially change scope, architecture, monetization, providers, or product direction.

---

# Repository Guardrails

- Preserve the current React and Vite implementation unless an approved Issue authorizes architectural change.
- Do not present weather data with more certainty than the underlying provider supports.
- Preserve source attribution and provider fallback behavior.
- Do not add native-platform, account, subscription, backend, or monetization scope without approval.
- Do not treat the provisional charter as authorization for broader product expansion.

---

# Completion Expectations

Before ending a work session:

- Confirm the assigned Issue acceptance criteria were addressed.
- Summarize changed files and verification performed.
- Note blockers, risks, and follow-up Issues.
- Update project documentation when required.
- Leave the repository in a clear handoff state.
