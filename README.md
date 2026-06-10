# LendIt — Community Item Sharing Platform

A full-stack Next.js 14 app for lending and borrowing items within a community. Built to replace a PHP/MySQL system, now deployable for free on **Vercel + Neon**.

---

## Tech Stack

| Layer     | Technology                   |
|-----------|------------------------------|
| Frontend  | Next.js 14 (App Router), Tailwind CSS |
| Auth      | NextAuth.js (JWT, credentials) |
| Database  | Neon (serverless Postgres)   |
| Hosting   | Vercel (free tier)           |
| ORM       | `@neondatabase/serverless` (raw SQL) |

---

## Features

- ✅ Email/password auth with bcrypt hashing
- ✅ Dashboard with live stats
- ✅ Browse & search items (by keyword, category, or location)
- ✅ List items: books, electronics, outdoor gear
- ✅ Send borrow requests
- ✅ Accept / reject incoming requests
- ✅ Mark items returned + rate borrowers (1–5 stars)
- ✅ Full transaction history
- ✅ Profile & password management with geolocation
- ✅ Penalty score tracking

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Neon database
1. Create a free account at https://neon.tech
2. Create a new project — note the connection string
3. Open the SQL editor and paste the contents of `schema.sql` — run it

### 3. Configure environment
```bash
cp .env.local.example .env.local
```
Edit `.env.local`:
```
DATABASE_URL="postgresql://..."   # your Neon connection string
NEXTAUTH_SECRET="..."             # run: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Run
```bash
npm run dev
```
Open http://localhost:3000

---

## Deploy to Vercel (Free)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/lendit.git
git push -u origin main
```

### Step 2 — Create Vercel project
1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New → Project**
3. Import your `lendit` repository
4. In **Environment Variables**, add:
   - `DATABASE_URL` — your Neon connection string
   - `NEXTAUTH_SECRET` — your generated secret
   - `NEXTAUTH_URL` — `https://your-project.vercel.app` (fill after first deploy)
5. Click **Deploy**

### Step 3 — Update NEXTAUTH_URL
After first deploy, Vercel gives you a URL like `lendit-abc123.vercel.app`.
Go to Project Settings → Environment Variables → update `NEXTAUTH_URL` to that URL.
Redeploy.

---

## Project Structure

```
src/
  app/
    login/          Login page
    signup/         Registration page
    dashboard/      Home dashboard
    search/         Browse & search items
    borrow/[id]/    Item detail + borrow request
    inventory/      My listed items
    inventory/add/  Add new item
    requests/       Incoming borrow requests
    history/        Transaction history + return & rate
    account/        Profile & password settings
    api/
      auth/         NextAuth + signup
      items/        Create & delete items
      borrow/       Send borrow request
      requests/     Accept/reject requests
      rating/       Return item + rate borrower
      user/         Update profile & password
  components/
    Sidebar.tsx     Navigation sidebar
    AppLayout.tsx   Auth-guarded layout
    ItemCard.tsx    Reusable item display card
    StarRating.tsx  Star display component
  lib/
    db.ts           Neon database connection
    auth.ts         NextAuth configuration
```

---

## Notes

- Images are currently stored as URLs. For file uploads, integrate **Cloudinary** (free tier) or **Vercel Blob**.
- The `schema.sql` file includes the full Postgres schema and some demo seed data.
- Passwords are hashed with bcrypt — no plaintext passwords anywhere.
