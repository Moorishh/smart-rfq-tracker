# Smart RFQ Tracker

A modern, multi-user RFQ (Request for Quote) tracker for inside sales teams.
Built with Next.js 15, Supabase, Tailwind, and shadcn/ui.

## Features

- **Auth & teams** — email/password auth, shared workspaces with role-based access
- **Clients & suppliers** — full CRM with contacts per company
- **RFQ pipeline** — 9-stage pipeline, priority levels, follow-ups with overdue alerts
- **Table & Kanban views** — switch on the fly
- **Supplier quotes** — track multiple quotes per RFQ with margin calculation
- **Activity timeline** — full audit trail of changes + manual notes per RFQ
- **Row-Level Security** — every row scoped to your team in Postgres
- **Modern UI** — shadcn/ui components, responsive, accessible

## Tech stack

- Next.js 15 (App Router) + TypeScript
- Supabase (Postgres + Auth + RLS)
- Tailwind CSS v3 + shadcn/ui + Radix primitives
- Server Actions for all mutations
- Zod for input validation

## Local setup

```bash
npm install
cp .env.example .env.local       # fill in your Supabase keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

The schema lives in Supabase migrations (already applied to the project).
Tables: `profiles`, `teams`, `team_members`, `team_invitations`, `clients`,
`client_contacts`, `suppliers`, `supplier_contacts`, `rfqs`, `quotes`,
`activities`. All protected by row-level security policies that scope every
row to the user's team.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Add env vars in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (e.g. `https://your-app.vercel.app`)
4. Deploy.
