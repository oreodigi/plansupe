# PlanSupe

PlanSupe is a mobile-first business setup workspace. Each user has a private account and can create multiple businesses, generate category-specific setup requirements, track work, manage vendors, and monitor launch readiness and cost.

## Product capabilities

- Supabase email/password authentication with server-side sessions
- Row Level Security so users can access only their own businesses
- Multi-business onboarding and switching
- Category-specific setup templates
- Setup requirement status and cost tracking
- Business tasks and vendor directory
- Database-derived readiness, forecast, committed, and paid totals
- Responsive desktop and 360px mobile application layouts

## Stack

- Next.js 16 App Router and Server Actions
- React 19 and TypeScript
- Supabase Auth and PostgreSQL
- Vercel hosting

## Local setup

Copy `.env.example` to `.env.local` and provide the Supabase project values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_replace_me
```

Then run:

```powershell
npm.cmd install
npm.cmd run dev
```

Validation:

```powershell
npm.cmd run typecheck
npm.cmd run build
```

Database changes are tracked in `supabase/migrations` and should be applied through the Supabase migration workflow.
