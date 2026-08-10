# Lubb al-Mandūmah (LΛM) - Project Overview

This document provides a comprehensive overview of the Lubb al-Mandūmah (LΛM) corporate website. It is designed to help new developers, architects, and stakeholders understand what has been built, the architectural decisions made, and how to maintain or extend the project.

---

## 1. Executive Summary

LΛM is the parent company and central hub for a suite of enterprise SaaS products (ATOM, AimHighSERP, MAAMS, AMAL, PointO). 

The goal of this project was to build a **premium, highly performant, and secure corporate website** that acts as the public face of the ecosystem. It serves to generate leads for enterprise software demos and establish corporate credibility.

**Key Architectural Rules Followed:**
- **Separation of Concerns**: The website is strictly a marketing and lead-generation tool. It is **not** an ERP, CRM, or client portal. 
- **Standalone Products**: LΛM's SaaS platforms are built separately. The website only links to them.
- **Config-Driven Content**: To avoid heavy database dependencies for simple text changes, all content is driven by TypeScript configuration files (`lib/config/`).

---

## 2. Technology Stack

### Frontend (User Interface)
- **Framework**: [Next.js 14/15](https://nextjs.org/) (App Router)
- **Language**: TypeScript (Strict mode enabled)
- **Styling**: Vanilla CSS (`app/globals.css`) with custom properties/variables. No heavy utility frameworks like Tailwind were used to maintain complete control over the bespoke premium dark-mode aesthetic.
- **Fonts**: Google Fonts (Playfair Display for headings, Inter for body text).

### Backend (Data & Security)
- **BaaS**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Data Fetching**: Next.js Server Actions (`lib/actions/`)
- **Security**: Row Level Security (RLS) is enabled on all tables. Public can insert (submit forms), but only the server (via Service Role Key) can read/update/delete.

### Deployment & Hosting
- **Hosting**: Optimized for [Vercel](https://vercel.com/) (or any standard Node.js environment).
- **Architecture**: 100% Statically Generated (SSG) where possible, with Server Actions for dynamic form submissions.

---

## 3. Directory Structure & Layout

The project follows the standard Next.js App Router structure, heavily modularized for scalability:

```text
/Lubb al Mandumah LAM
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── (marketing)/      # Public pages (about, solutions, industries, etc.)
│   ├── staff-login/      # Internal secure gateway (placeholder for SSO)
│   ├── globals.css       # Global design tokens and styles
│   └── layout.tsx        # Root HTML layout and metadata
│
├── components/           # Reusable UI Components
│   ├── forms/            # Contact and Demo request forms
│   ├── home/             # Sections specific to the homepage
│   ├── layout/           # Header, Footer, Page Heroes
│   ├── products/         # Product cards and catalogues
│   └── ui/               # Buttons, Breadcrumbs, standard elements
│
├── lib/                  # Core Business Logic & Data
│   ├── actions/          # Next.js Server Actions (Form processing)
│   ├── config/           # CMS Data (Products, Solutions, Industries, Nav)
│   └── supabase/         # Supabase client, server, and admin utilities
│
├── public/               # Static assets (Images, Favicons)
│
├── docs/                 # Project documentation and master plans
│
└── supabase/migrations/  # SQL scripts for database initialization
```

---

## 4. Application Flow & Routing

### Public Routes
- **`/` (Home)**: The entry point featuring a dynamic hero slider, product ecosystems, industry solutions, and lead-gen CTAs.
- **`/products`**: The catalogue of all LΛM software products. Clicking a product goes to `/products/[slug]`.
- **`/solutions` & `/industries`**: Groupings of LΛM offerings tailored to specific business needs or sectors. Both have dynamic `[slug]` detail pages.
- **`/insights`**: The corporate blog and thought leadership hub.
- **`/about`**, **`/partners`**: Trust-building corporate pages.
- **`/contact`** & **`/request-demo`**: The primary conversion funnels. Form submissions are sent securely to the Supabase backend.

### Internal Routes
- **`/staff-login`**: A discreet gateway intended for internal LΛM staff. Currently, it acts as a secure shell ready to be wired to LAM ID / SSO. It is intentionally hidden from the main public navigation.

---

## 5. Backend Implementation (Supabase)

The database schema is purposefully minimal. We do not store product user data or subscriptions here.

**Tables Created:**
1. `contact_requests`: Stores data from the general contact form.
2. `demo_requests`: Stores data from the enterprise demo request form.

**Security Flow:**
1. User submits a form on the frontend.
2. The form calls a Next.js **Server Action** (`lib/actions/forms.ts`).
3. The Server Action sanitizes the data and securely inserts it into Supabase using the `SUPABASE_SERVICE_ROLE_KEY`.
4. Row Level Security (RLS) ensures that even if the public Anon key were compromised, malicious users cannot read the lead data.

*(SQL initialization scripts can be found in `supabase/migrations/`)*

---

## 6. Content Management System (Config-Driven CMS)

To avoid building a complex Admin Dashboard for simple text changes, the website relies on a **Config-Driven CMS**. 

All textual data for products, solutions, industries, and navigation is stored in strongly-typed TypeScript arrays inside `lib/config/`.

**How to update content:**
1. Open the relevant file (e.g., `lib/config/products.ts`).
2. Add, edit, or remove objects in the array.
3. The TypeScript compiler enforces strict rules (e.g., you cannot forget to add a `title` or `slug`).
4. Commit and push the code. The website will rebuild with the new content instantly.

This approach guarantees 100% uptime, zero database latency for content rendering, and perfect type safety.

---

## 7. Development & Deployment Guide

### Local Setup
1. Clone the repository.
2. Run `npm install`.
3. Duplicate `.env.example` to `.env.local` and fill in the Supabase URL and Keys.
4. Run `npm run dev` to start the local server at `http://localhost:3000`.

### Deployment (Vercel)
1. Import the GitHub repository to Vercel.
2. Vercel will automatically detect it as a Next.js project.
3. Add the three Environment Variables from `.env.local` to the Vercel project settings.
4. Click Deploy.

---

## 8. Future Roadmap & Extension Points

- **LAM Central Integration**: The leads generated and stored in Supabase (`demo_requests`) can be connected to the future LAM Central CRM via webhooks or direct backend sync.
- **LAM ID (SSO)**: The `/staff-login` route is prepped and ready to be integrated with a global OAuth/SSO provider.
- **Actual Product Apps**: Platforms like ATOM and MAAMS will be built as completely separate codebases and deployed to their own subdomains (e.g., `atom.lubbalmandumah.com`), authenticating via LAM ID. The website simply links out to them.

---
*Generated by Antigravity AI on 2026-08-10. End of Document.*
