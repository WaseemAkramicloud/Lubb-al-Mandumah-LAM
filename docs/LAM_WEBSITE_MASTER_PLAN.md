# LAM Website Master Plan
> **Project**: Lubb al-Mandumah / LΛM — Corporate Website
> **Stage**: 0 — Audit, Preserve and Simplify
> **Date**: 2026-08-08
> **Maintained by**: Antigravity (Senior Full-Stack Web Architect)
> **Approach**: Start simple, keep the foundation extensible, add complexity only when it creates value.

---

## SECTION 1 — Existing Project Audit

### 1.1 Repository (`/Users/waseemakram/My Comp Data/Lubb al Mandumah LAM/`)

| Path | Type | State | Notes |
|------|------|-------|-------|
| `.agents/AGENTS.md` | Config | ✅ Exists | Project memory, rules, Supabase credentials, architectural non-negotiables |
| `docs/LAM_MASTER_PLAN.md` | Doc | ✅ Exists | Initial stage plan (Stage 0 complete) |
| `public/favicon-source.jpg` | Asset | ✅ Exists | 1024×768 JPEG — reception lobby with LAM logo mark |
| `public/images/slider/slider-01-boardroom-logo-wall.jpg` | Asset | ✅ Exists | 1024×768 JPEG |
| `public/images/slider/slider-02-building-exterior.jpg` | Asset | ✅ Exists | 1024×768 JPEG |
| `public/images/slider/slider-03-conference-room.jpg` | Asset | ✅ Exists | 1024×768 JPEG |
| `public/images/slider/slider-04-reception-lobby.jpg` | Asset | ✅ Exists | 1024×768 JPEG |
| `package.json` | Code | ❌ Missing | No framework scaffold yet |
| `app/` | Code | ❌ Missing | No routes |
| `components/` | Code | ❌ Missing | No components |
| `lib/` | Code | ❌ Missing | No utilities |
| `.env.local` | Config | ❌ Missing | Credentials documented in AGENTS.md, file not yet created |
| `.git/` | VCS | ❌ Missing | Not a git repo yet (GitHub repo exists but empty) |

**Summary**: The project is a true blank slate — no framework, no routes, no components, no database schemas. Only assets and documentation exist. Nothing to preserve in code. Nothing to discard. We build clean.

### 1.2 Supabase Database (`ykrjmctfmywhymgpkqlu`)

| Layer | State |
|-------|-------|
| Public schema tables | ❌ None |
| Custom schemas | ❌ None |
| Auth users | ❌ Zero |
| Storage buckets | ❌ None |
| RPC functions | ❌ None |
| RLS policies | ❌ None |

**Summary**: Completely empty. No migration conflicts, no schema debt.

### 1.3 GitHub (`WaseemAkramicloud/Lubb-al-Mandumah-LAM`)

| Item | State |
|------|-------|
| Repo | ✅ Exists (public) |
| Commits | ❌ 0 (empty) |
| Branches | `main` only |

**Summary**: Empty repo — a clean first push.

---

## SECTION 2 — What Will Be Kept

| Item | Keep? | Reason |
|------|-------|--------|
| `.agents/AGENTS.md` | ✅ Keep | Core project memory + all credentials |
| `docs/LAM_MASTER_PLAN.md` | ✅ Keep | Build tracking doc |
| `docs/LAM_WEBSITE_MASTER_PLAN.md` | ✅ Keep | This document |
| `public/images/slider/*.jpg` | ✅ Keep | All 4 hero slider images ready to use |
| `public/favicon-source.jpg` | ✅ Keep | Source for favicon generation |

---

## SECTION 3 — What Conflicts With The Simple Website Direction

| Item | Conflict | Resolution |
|------|----------|------------|
| Previous docs referenced Control Hub, CRM, SSO, LAM ID, billing engine | ❌ Out of scope for now | Noted in AGENTS.md as future phases — not built in this stage |
| LAM ID / SSO | ❌ Out of scope | Do not build. Staff Login links to a placeholder stub only. |
| Product ERP modules (ATOM, AimHighSERP etc.) | ❌ Out of scope | These are separate products built separately when instructed |
| Client/company/user portals | ❌ Out of scope | Not built in this stage |
| Billing/accounting engine | ❌ Out of scope | Not built |
| Giant unified database for all products | ❌ Out of scope | Not built |
| Old ATOM docs that described prior LAM vision | ⚠️ Discarded as reference | The architecture in this plan supersedes all prior docs |

---

## SECTION 4 — Website Page Map

### 4.1 Public Pages

```
/ (Home)
├── Hero slider (4 images, animated)
├── Intro — what LAM is (parent company / ecosystem)
├── Products strip — card grid (ATOM, AimHighSERP, MAAMS, AMAL, PointO + "more coming")
├── Solutions teaser — 3–4 industry solution headlines
├── Stats / trust strip (numbers, credentials)
├── Partners & Clients logo strip
├── Latest Insights (2–3 blog teasers)
└── CTA section — "Request Demo"

/products
├── Page header — "Our Products & Platforms"
├── Product cards (each: name, tagline, short description, logo/icon, CTA)
│   ├── ATOM — ERP & Operations
│   ├── AimHighSERP — SEO Intelligence
│   ├── MAAMS — Access & Compliance (restricted)
│   ├── AMAL — Finance & Investment
│   └── PointO — Point of Sale
└── "Future products" teaser / pipeline section

/solutions
├── Page header — "Solutions by Need"
└── Solution cards (e.g. Enterprise Operations, Digital Marketing, Compliance & Governance,
                     Financial Management, Retail & POS)

/industries
├── Page header — "Industries We Serve"
└── Industry cards (e.g. Government, Finance, Retail, Healthcare, Logistics, Hospitality)

/partners
├── Page header — "Partners & Clients"
├── Logo grid
├── Partnership tiers (if applicable)
└── Partnership CTA

/about
├── Page header — "About Lubb al-Mandumah"
├── Mission & Vision
├── Our Story
├── Leadership (optional — placeholder if no data yet)
└── Values

/insights
├── Page header — "Insights & Updates"
└── Blog post grid (card layout, filterable by category)

/insights/[slug]
└── Full blog article page

/contact
├── Page header — "Get In Touch"
├── Contact form (Name, Email, Company, Message, Subject dropdown)
├── Office/contact details
└── Map embed (optional)

/request-demo          ← Primary CTA destination
├── Demo request form
└── Confirmation state
```

### 4.2 Internal / Utility Pages

```
/staff-login           ← Discreet. NOT in main nav. Footer only (small text link).
                         Links to a real auth route ONLY if one exists. 
                         In this stage: renders a "Coming Soon / Internal Access" 
                         holding page — does NOT expose any fake login form.

/404                   ← Custom not-found page
/500                   ← Custom error page (optional at this stage)
```

### 4.3 Navigation Structure

**Header (top)**
```
[LΛM Logo]    Home  Products  Solutions  Industries  Partners & Clients  About  Insights  Contact    [Request Demo]
```

**Footer**
```
Logo + tagline | Quick links | Products | Contact info | Social | Legal
                                                               Staff Login (tiny, discreet)
```

---

## SECTION 5 — Component Plan

### 5.1 Layout Components

| Component | File | Purpose |
|-----------|------|---------|
| `RootLayout` | `app/layout.tsx` | Global HTML shell, fonts, metadata |
| `Header` | `components/layout/Header.tsx` | Nav + logo + CTA button |
| `Footer` | `components/layout/Footer.tsx` | Links + staff login link |
| `PageHero` | `components/layout/PageHero.tsx` | Reusable inner-page hero header |

### 5.2 Home Page Sections

| Component | File | Purpose |
|-----------|------|---------|
| `HeroSlider` | `components/home/HeroSlider.tsx` | Auto-advancing image slider (4 images) |
| `IntroSection` | `components/home/IntroSection.tsx` | What is LAM |
| `ProductsStrip` | `components/home/ProductsStrip.tsx` | Product card grid |
| `SolutionsTeaser` | `components/home/SolutionsTeaser.tsx` | Solutions preview |
| `StatsStrip` | `components/home/StatsStrip.tsx` | Trust numbers |
| `PartnersStrip` | `components/home/PartnersStrip.tsx` | Logo strip |
| `InsightsTeaser` | `components/home/InsightsTeaser.tsx` | Latest blog teasers |
| `CtaSection` | `components/home/CtaSection.tsx` | Request Demo CTA |

### 5.3 Shared / UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `ProductCard` | `components/ui/ProductCard.tsx` | Reusable product card |
| `BlogCard` | `components/ui/BlogCard.tsx` | Reusable blog preview card |
| `IndustryCard` | `components/ui/IndustryCard.tsx` | Industry tile |
| `SolutionCard` | `components/ui/SolutionCard.tsx` | Solution card |
| `Button` | `components/ui/Button.tsx` | Primary / secondary / ghost variants |
| `SectionHeader` | `components/ui/SectionHeader.tsx` | Standard section title + subtitle |
| `ContactForm` | `components/ui/ContactForm.tsx` | Contact / demo request form |

### 5.4 Global Styles

| File | Purpose |
|------|---------|
| `app/globals.css` | CSS custom properties, reset, typography, dark theme tokens |

---

## SECTION 6 — Data / Content Plan

### 6.1 Phase A: Static (No Database) — Build With Now

All content hardcoded in code for the initial build. No CMS, no Supabase tables yet.

| Content | Source | Notes |
|---------|--------|-------|
| Nav links | `lib/config/navigation.ts` | Central config object |
| Product list | `lib/config/products.ts` | Array of product objects |
| Solutions list | `lib/config/solutions.ts` | Array of solution objects |
| Industries list | `lib/config/industries.ts` | Array of industry objects |
| Blog posts | `lib/config/blog.ts` | Hardcoded stubs initially |
| Partners/clients | `lib/config/partners.ts` | Array of partner objects |
| Site metadata | `lib/config/site.ts` | Title, description, OG tags |
| Contact details | `lib/config/contact.ts` | Address, email, phone |

> All config files are typed TypeScript — making future CMS migration a clean swap of the data source, not a rewrite of components.

### 6.2 Phase B: CMS-Backed (Future Stage, Not Now)

When instructed, add Supabase tables:
- `cms.pages` — editable page content
- `cms.blog_posts` — blog articles
- `cms.products_showcase` — product cards
- `cms.partners` — partner logos
- `cms.navigation` — nav links

This is **future scope only** — do not build now.

### 6.3 Supabase Usage in This Stage

| Feature | In Scope? |
|---------|-----------|
| Auth / user accounts | ❌ No |
| Any database tables | ❌ No |
| Contact form submission (store to DB) | ⚠️ Optional — can use email service (Resend/Formspree) instead |
| Storage for images | ❌ No — images served from `public/` |

---

## SECTION 7 — Stage Checklist

### Stage 0 — Audit (Current)
- [x] Repository inspected
- [x] Supabase inspected — empty confirmed
- [x] GitHub inspected — empty confirmed
- [x] No destructive changes made
- [x] `LAM_WEBSITE_MASTER_PLAN.md` created
- [ ] User reviews and approves this plan

### Stage 1 — Foundation Scaffold *(Complete)*
- [x] Initialise Next.js 14 (App Router, TypeScript) in repo root
- [x] Install dependencies: none beyond Next.js defaults (no UI library — vanilla CSS)
- [x] Create `.env.local` with Supabase credentials
- [x] Create `app/layout.tsx` with fonts (Playfair Display + Inter from Google Fonts)
- [x] Create `app/globals.css` with full design token system
- [x] Create `lib/config/site.ts` (metadata)
- [x] Verify: `npm run dev` runs, blank page loads
- [x] Verify: TypeScript compiles clean
- [x] **Stage gate**: user checks browser, approves

### Stage 2 — Header & Footer *(Complete)*
- [x] `components/layout/Header.tsx` — responsive nav, logo, CTA
- [x] `components/layout/Footer.tsx` — links, staff login (discreet text only)
- [x] Mobile hamburger menu
- [x] Scroll-aware header (transparent → solid on scroll)
- [x] **Stage gate**: user checks browser, approves

### Stage 3 — Home Page *(Complete)*
- [x] Hero slider (4 images, auto-advance, crossfade)
- [x] Intro section
- [x] Products strip
- [x] Solutions teaser
- [x] Stats strip
- [x] Partners strip
- [x] Insights teaser (Skipped explicitly per minimal scope, replaced by CtaSection)
- [x] CTA section
- [x] **Stage gate**: user checks browser, approves

### Stage 4 — Inner Pages *(awaiting Stage 3 approval)*
- [ ] `/products` page
- [ ] `/solutions` page
- [ ] `/industries` page
- [ ] `/partners` page
- [ ] `/about` page
- [ ] `/insights` (blog listing)
- [ ] `/insights/[slug]` (blog detail)
- [ ] `/contact` page
- [ ] `/request-demo` page
- [ ] `/staff-login` holding page (no fake auth)
- [ ] Custom 404
- [ ] **Stage gate**: user checks all pages, approves

### Stage 5 — Polish, SEO & Performance *(awaiting Stage 4 approval)*
- [ ] Favicon generation from source image
- [ ] SEO metadata per page (title, description, OG)
- [ ] PWA manifest
- [ ] Lighthouse audit
- [ ] Image optimisation (next/image for all photos)
- [ ] `sitemap.xml` + `robots.txt`
- [ ] **Stage gate**: Lighthouse 90+, user approves

### Stage 6 — Deployment *(awaiting Stage 5 approval)*
- [ ] GitHub push (all code committed)
- [ ] Vercel deployment
- [ ] Domain connection (if domain is ready)
- [ ] Environment variables set in Vercel
- [ ] **Stage gate**: live URL verified by user

---

## SECTION 8 — Risks & Rollback Notes

### Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Slider images too large for web (1024×768 JPEG) | Low | Use `next/image` with automatic optimisation + WebP conversion |
| Favicon crop from lobby scene may not isolate logo well | Medium | May need manual crop; will present options at Stage 5 |
| No domain confirmed yet | Low | Can deploy to `*.vercel.app` subdomain for review |
| Contact form submissions (no backend yet) | Low | Use Resend (free tier) or Formspree — no DB required |
| Future CMS migration complexity | Low | All content in typed config files — migration is a data swap only |

### Rollback Notes

| Stage | Rollback Action |
|-------|----------------|
| Stage 1 | Delete scaffold files; keep `public/`, `.agents/`, `docs/` |
| Stage 2 | Delete `components/layout/` — rest of app unaffected |
| Stage 3 | Delete `components/home/` and `app/page.tsx` — inner pages unaffected |
| Stage 4 | Delete individual page files — each page is independent |
| Stage 5 | Revert metadata files — no structural change |
| Stage 6 | Disconnect Vercel deployment — no data loss |

---

## SECTION 9 — Proposed Changes Awaiting Approval

> [!IMPORTANT]
> **No changes have been made to the codebase yet. Everything below is the proposed work for Stage 1, pending your explicit "go" instruction.**

### Proposed Stage 1 Actions (Next Steps)

#### New files to create:
| File | Purpose |
|------|---------|
| `package.json` | Next.js 14 project |
| `next.config.ts` | Image domains config |
| `tsconfig.json` | TypeScript config |
| `.env.local` | Supabase keys (not committed to git) |
| `.gitignore` | Standard Next.js gitignore |
| `app/layout.tsx` | Root layout with fonts + metadata |
| `app/page.tsx` | Home page (blank placeholder) |
| `app/globals.css` | Full design token system |
| `lib/config/site.ts` | Site metadata config |
| `public/fonts/` | (if self-hosting fonts — else Google Fonts CDN) |

#### No files will be deleted.
#### No Supabase tables will be created.
#### No auth will be implemented.

---

> **Status**: Stages 1, 2, and 3 complete. Awaiting user review and approval before Stage 4 begins.
> **Last Updated**: 2026-08-08
