# 🎓 College Predictor

A production-ready web application that helps students predict which colleges and branches they may be eligible for based on their examination rank and historical cutoff data.

## Features

### Student Features
- 📝 **Registration & Login** — Email/password authentication with email verification
- 🔍 **College Prediction** — Enter exam details, rank, category, and get matching colleges
- 📊 **Results with Filters** — Filter by state, branch, and college type
- 📄 **PDF Report** — Download prediction results as PDF
- 📧 **Email Report** — Receive results via email
- 📚 **Search History** — View and re-run past searches

### Admin Features
- 🏫 **Manage Colleges** — Add, edit, delete colleges
- 📚 **Manage Branches** — Add, edit, delete branches per college
- 📝 **Manage Exams** — Add, edit exams
- 📈 **Cutoff Data** — View cutoffs + bulk import via CSV/Excel
- 👨‍🎓 **Manage Students** — View registered students
- 📉 **Search Analytics** — Daily search trends and recent activity
- 📧 **Email Logs** — Monitor sent emails

### Security
- 🔐 JWT Authentication via Supabase
- 🛡️ Row Level Security (RLS) on all tables
- ✅ Input validation with Zod schemas
- 🚫 Rate limiting on prediction and email endpoints
- 🔒 XSS protection via security headers
- 🗝️ Route protection via Next.js middleware

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 15](https://nextjs.org/) | React framework (App Router) |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |
| [Supabase](https://supabase.com/) | Auth + PostgreSQL Database |
| [Resend](https://resend.com/) | Email delivery |
| [Zod](https://zod.dev/) | Input validation |
| [PapaParse](https://www.papaparse.com/) | CSV parsing |
| [SheetJS](https://sheetjs.com/) | Excel parsing |

## Prerequisites

- **Node.js** 18.0 or later — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Supabase account** — [Sign up](https://supabase.com/)
- **Resend account** — [Sign up](https://resend.com/) (optional, for emails)

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd college-predictor
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com/)
2. Go to **SQL Editor** and run:
   - `supabase/migrations/001_initial_schema.sql` (creates tables & policies)
   - `supabase/seed.sql` (loads sample data — optional)
3. Get your project credentials from **Settings > API**

### 3. Create Admin Account

In the Supabase **SQL Editor**, run:

```sql
-- First create the user via Supabase Auth dashboard or API
-- Then update their role to admin:
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

Or create the admin user via Supabase Dashboard:
1. Go to **Authentication > Users**
2. Click **Add User**
3. Enter email: `admin@example.com`, password: `ChangeMe123`
4. Run the SQL above to set the admin role

### 4. Configure Environment

```bash
cp .env.local.example .env.local
```

Fill in your Supabase and Resend credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth pages (login, register, etc.)
│   ├── dashboard/          # Student dashboard
│   ├── admin/              # Admin panel
│   └── api/                # API routes
├── components/             # React components
│   └── ui/                 # Reusable UI primitives
├── lib/                    # Utilities, clients, validators
│   └── supabase/           # Supabase client configs
├── types/                  # TypeScript type definitions
└── middleware.ts            # Route protection
```

## CSV/Excel Import Format

For bulk cutoff import, use these column headers:

| Column | Type | Required |
|---|---|---|
| exam_name | string | ✅ |
| college_name | string | ✅ |
| branch_name | string | ✅ |
| category | string | ✅ |
| gender | string | ✅ |
| home_state | string | ❌ |
| opening_rank | number | ✅ |
| closing_rank | number | ✅ |
| year | number | ✅ |

> **Note:** Exam, college, and branch names must match existing records in the database.

## License

MIT
