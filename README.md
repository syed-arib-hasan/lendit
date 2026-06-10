<div align="center">

# LendIt

**A community-driven platform for lending and borrowing everyday items**

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

[Live Demo](lendit-psi.vercel.app) · [Report a Bug](https://github.com/syed-arib-hasan/lendit/issues) · [Request a Feature](https://github.com/syed-arib-hasan/lendit/issues)

</div>

---

## About

LendIt is a full-stack web application that lets people within a community lend and borrow items — books, electronics, and outdoor gear — instead of buying things they only need once.

Originally built as a PHP/MySQL system, it was fully redesigned and migrated to a modern stack: Next.js 14 App Router, serverless PostgreSQL on Neon, and deployed for free on Vercel. Every security vulnerability from the original codebase (plaintext passwords, SQL injection, missing auth guards) was addressed in the rebuild.

## Features

- **Authentication** — Secure email/password login with bcrypt hashing and JWT sessions via NextAuth.js
- **Item listings** — List books, electronics, or outdoor gear with descriptions and images
- **Browse & search** — Search by keyword, filter by category, or find items near you
- **Borrow flow** — Send requests, accept or reject incoming requests, full request lifecycle management
- **Return & rate** — Mark items as returned and leave a 1–5 star rating for the borrower
- **Transaction history** — Full log of all past lending and borrowing activity
- **User profiles** — Manage name, location, contact info, profile photo, and password
- **Reputation system** — User ratings and penalty scores for late returns
- **Responsive design** — Clean sidebar layout that works on all screen sizes

---

## Tech Stack

| Layer     | Technology                   | Why                                               |
| --------- | ---------------------------- | ------------------------------------------------- |
| Framework | Next.js 14 (App Router)      | Server components, API routes, file-based routing |
| Language  | TypeScript                   | Type safety across the full stack                 |
| Styling   | Tailwind CSS                 | Utility-first, consistent design system           |
| Auth      | NextAuth.js                  | JWT sessions, credentials provider                |
| Database  | Neon (serverless Postgres)   | Free tier, works seamlessly with Vercel           |
| DB Client | `@neondatabase/serverless` | Built for serverless — no connection pool issues |
| Hosting   | Vercel                       | Free tier, automatic deploys from GitHub          |

---

## Architecture

```
src/
├── app/
│   ├── login/                  # Auth pages (no layout wrapper)
│   ├── signup/
│   ├── dashboard/              # Stats overview
│   ├── search/                 # Browse & filter items
│   ├── borrow/[id]/            # Item detail + borrow request
│   ├── inventory/              # Manage listed items
│   │   └── add/                # Add new item (book / electronic / gear)
│   ├── requests/               # Incoming borrow requests
│   ├── history/                # Transaction history + return & rate
│   ├── account/                # Profile & password settings
│   └── api/
│       ├── auth/               # NextAuth + signup endpoint
│       ├── items/              # Create & delete items
│       ├── borrow/             # Send borrow request
│       ├── requests/           # Accept / reject requests
│       ├── rating/             # Return item + submit rating
│       └── user/               # Update profile & password
├── components/
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── AppLayout.tsx           # Auth-guarded server layout
│   ├── ItemCard.tsx            # Reusable item display card
│   └── StarRating.tsx          # Star display component
└── lib/
    ├── db.ts                   # Neon database connection
    └── auth.ts                 # NextAuth configuration
```

---

## Security Improvements Over Original

The original PHP codebase had several critical vulnerabilities that were fixed in this rebuild:

| Issue            | Original                                  | This version                                        |
| ---------------- | ----------------------------------------- | --------------------------------------------------- |
| Password storage | Plaintext in database                     | bcrypt hashed                                       |
| SQL injection    | Raw string interpolation in queries       | Parameterized queries everywhere                    |
| Auth checks      | Inconsistent, bypassable                  | Server-side session guard on every protected route  |
| User model       | Separate lender/borrower tables with gaps | Unified users table, every user can lend and borrow |

---

## Roadmap

- [ ] Image uploads via Cloudinary or Vercel Blob
- [ ] Interactive map pin for location setting
- [ ] In-app notifications for request updates
- [ ] Mobile-responsive sidebar with hamburger menu
- [ ] Admin dashboard for moderation

---

## License

MIT — feel free to use this project as a reference or starting point.
