# PlanSupe MVP

A mobile-first, interactive MVP based on the PlanSupe V1/V2 development plan.

## Included

- Business dashboard with readiness, budget, committed, paid and outstanding rollups
- Template-style setup modules and seeded Restaurant/QSR requirements
- Setup-item creation, status progression and payment recording
- Tasks with completion state
- Reusable vendor directory and vendor creation
- Persistent browser storage so changes survive refreshes
- Responsive layouts optimized for 360px mobile screens

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open the URL printed by Vite. To create a production build:

```powershell
npm.cmd run build
```

## Current architecture

This first slice is a browser-persisted product prototype. It validates the core linked-record behavior and mobile UX. Production V1 should replace local storage with the PostgreSQL organization/business model, authenticated server APIs and private object storage described in the source plan.
