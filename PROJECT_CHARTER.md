# PROJECT_CHARTER.md

Version: 0.2
Approval Status: Requires Project Owner Review
Approved By: David Taylor
Approved Date: 2026-07-12

> [!IMPORTANT]
> ## About This Document
>
> This charter documents the current repository and its existing web implementation. Broader product strategy or cross-platform expansion should be incorporated only through an approved charter revision.

---

# Project Information

**Project Name:** Weather App

**Project Type:** Responsive web weather application

**Project Owner:** David Taylor

**Engineering Standards Version:** Taylor Creative Development Standards v0.2

**Status:** Active

---

# Vision

Provide a dependable, understandable, and visually useful weather experience that helps users quickly understand current conditions, forecasts, alerts, and radar information.

The current repository implements that vision as a responsive React and Vite web application. Future platform expansion may be considered through deliberate product planning and Project Owner approval.

---

# Purpose

Weather information is often fragmented across forecasts, alerts, and radar products. This project exists to bring the most important information together in one clear experience while preserving reliable source attribution and graceful fallback behavior.

---

# Design Principles

These project-specific principles supplement the Taylor Creative Development Core Principles rather than duplicating or replacing them.

- Present essential weather information clearly and quickly.
- Preserve user trust by identifying data sources and avoiding false precision.
- Use strong defaults while allowing useful exploration of forecast and radar detail.
- Degrade gracefully when a preferred provider, key, or browser capability is unavailable.
- Keep the base experience complete and useful.
- Avoid complexity that does not materially improve weather understanding.

---

# Target Audience

People who want a straightforward weather dashboard for current conditions, near-term forecasts, alerts, and radar without unnecessary friction.

---

# Scope

## In Scope

- Current weather conditions for a selected location
- City and ZIP-code search
- Browser geolocation with a saved-location fallback
- Five-day forecast with daily and hourly detail
- U.S. weather alerts
- Animated radar visualization
- Provider fallback behavior for radar
- Responsive web presentation
- Static deployment through GitHub Pages

## Out of Scope

- Product directions not represented by approved GitHub Issues or an approved charter revision
- Unsupported or private weather-provider interfaces
- Claims of precision or completeness beyond the underlying data sources
- Unapproved native-platform, account, subscription, or cloud-service expansion

---

# Initial Release Goals

- Deliver reliable current conditions and forecast information.
- Surface relevant U.S. weather alerts.
- Provide an understandable animated radar experience.
- Preserve useful operation when the primary radar provider is unavailable.
- Deploy a stable production build through GitHub Pages.

---

# Strategic Technical Direction

- Continue using React and Vite for the current web application unless an approved architecture decision changes that direction.
- Use Open-Meteo for forecast and geocoding in the current implementation.
- Use the National Weather Service for U.S. alert data.
- Use MapTiler Weather as the primary radar provider with RainViewer as a fallback.
- Keep browser-exposed keys appropriately restricted for the static-hosting model.
- Treat future platform or backend expansion as separate approved strategic work.

---

# Success Criteria

- Users can find and understand current weather conditions quickly.
- Forecast, alert, and radar information load reliably under expected conditions.
- Radar fallback behavior works when the primary provider is unavailable or unconfigured.
- The interface remains usable across supported screen sizes.
- Production deployment is repeatable and documented.

---

# Assumptions

- Current providers will continue offering public interfaces sufficient for the implemented features.
- Users may deny geolocation permission, requiring search and saved-location fallbacks.
- Radar and alert coverage may vary by provider and geography.
- Broader product planning may revise this charter later.

---

# Constraints

- The current application is statically hosted on GitHub Pages.
- Browser-exposed provider keys must be restricted by approved referrers.
- Data accuracy, timeliness, and geographic coverage depend on external providers.
- Current repository scope should not be expanded without approved planning and GitHub Issues.

---

# Risks

- External provider outages or policy changes may affect functionality.
- Browser geolocation may be unavailable or denied.
- Radar providers may differ in timing, coverage, and visual behavior.
- The current repository may diverge from broader Weather App product planning unless the charter is deliberately revised.

---

# References

- `CORE_PRINCIPLES.md`
- `ENGINEERING_HANDBOOK.md`
- `ROLE_ASSIGNMENTS.md`
- `PROJECT_STATUS.md`
- `README.md`

---

# Approval

**Approved By:** David Taylor

**Approval Date:** 2026-07-12
