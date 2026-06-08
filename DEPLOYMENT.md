# 🚀 Deployment Guide — College Predictor

This guide covers deploying College Predictor to **Vercel** with **Supabase** as the backend.

## Prerequisites

- [Vercel account](https://vercel.com/)
- [Supabase project](https://supabase.com/) (already set up)
- [Resend account](https://resend.com/) with a verified domain
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

---

## Step 1: Supabase Setup

### 1.1 Create Project

1. Go to [app.supabase.com](https://app.supabase.com/)
2. Click **New Project**
3. Choose an organization, name, database password, and region
4. Wait for the project to initialize

### 1.2 Run Migrations

1. Go to **SQL Editor**
2. Open and run `supabase/migrations/001_initial_schema.sql`
3. Verify tables were created in **Table Editor**

### 1.3 Load Seed Data (Optional)

Run `supabase/seed.sql` in the SQL Editor to load sample colleges, exams, and cutoffs.

### 1.4 Create Admin Account

1. Go to **Authentication > Users**
2. Click **Add User** (email/password)
3. Email: `admin@example.com`, Password: `ChangeMe123`
4. In SQL Editor, run:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@example.com';
```

### 1.5 Configure Auth Settings

1. Go to **Authentication > URL Configuration**
2. Set **Site URL** to your Vercel domain (e.g., `https://college-predictor.vercel.app`)
3. Add redirect URLs:
   - `https://your-domain.vercel.app/api/auth/callback`
   - `http://localhost:3000/api/auth/callback` (for local dev)

### 1.6 Get API Keys

Go to **Settings > API** and note:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2: Resend Setup

1. Go to [resend.com/domains](https://resend.com/domains)
2. Add and verify your domain
3. Go to **API Keys** and create a new key
4. Note the key → `RESEND_API_KEY`

---

## Step 3: Deploy to Vercel

### 3.1 Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel auto-detects Next.js

### 3.2 Configure Environment Variables

Add these in Vercel's **Environment Variables** section:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | `noreply@yourdomain.com` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel domain URL |

### 3.3 Deploy

Click **Deploy**. Vercel will build and deploy your application.

### 3.4 Update Supabase Redirect URLs

After deployment, add your Vercel URL to Supabase's allowed redirect URLs:

```
https://your-app.vercel.app/api/auth/callback
```

---

## Step 4: Post-Deployment Checklist

- [ ] Verify landing page loads
- [ ] Register a test student account
- [ ] Check email verification flow
- [ ] Login as admin (`admin@example.com`)
- [ ] Add exams, colleges, branches via admin panel
- [ ] Upload cutoff data via CSV
- [ ] Run a prediction as a student
- [ ] Test PDF download
- [ ] Test email report sending
- [ ] Verify mobile responsiveness

---

## Custom Domain (Optional)

1. In Vercel: **Settings > Domains > Add Domain**
2. Add your custom domain and configure DNS
3. Update `NEXT_PUBLIC_APP_URL` environment variable
4. Update Supabase redirect URLs with the new domain

---

## Troubleshooting

### Auth callback errors
- Ensure redirect URLs are added in Supabase Auth settings
- Check that `NEXT_PUBLIC_APP_URL` matches your deployment URL

### Emails not sending
- Verify your domain in Resend
- Check that `RESEND_FROM_EMAIL` uses your verified domain
- During development, Resend only delivers to the account owner's email

### Database connection issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and keys are correct
- Check RLS policies if data isn't loading

### Build failures
- Run `npm run build` locally first to catch TypeScript errors
- Ensure all environment variables are set in Vercel
