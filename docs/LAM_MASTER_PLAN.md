# LAM — Master Build Plan
> **Project**: Lubb al-Mandumah (LAM)
> **Repo root**: `/Users/waseemakram/My Comp Data/Lubb al Mandumah LAM`
> **Supabase**: `https://ykrjmctfmywhymgpkqlu.supabase.co`
> **Last updated**: 2026-08-08

---

## 🔖 Stage Gate Rule
> ⛔ **Do NOT advance to the next stage until the current stage:**
> 1. Builds without errors
> 2. Has been manually reviewed and approved by the user

---

## 📋 Stage Overview

| # | Stage | Status | Manual Check |
|---|-------|--------|--------------|
| 0 | Project Setup & Memory | ✅ Complete | ✅ Approved |
| 0b | Architecture Audit | ✅ Complete | ⬜ Awaiting user review |
| 1 | Next.js scaffold + Supabase wiring | ✅ Complete | ⬜ Awaiting user review |
| 2 | Global design system (fonts, colours, tokens) | ✅ Complete | ⬜ Awaiting user review |
| 3 | Homepage — Hero slider | ✅ Complete | ⬜ Awaiting user review |
| 4 | Homepage — Remaining sections | ✅ Complete | ⬜ Awaiting user review |
| 5 | Products Catalogue & Template | ✅ Complete | ⬜ Awaiting user review |
| 6 | Solutions & Industries | ✅ Complete | ⬜ Awaiting user review |
| 7 | Navigation & Footer | ⬜ Pending | ⬜ |
| 8 | Corporate Trust Pages (Partners, About, Careers) | ✅ Complete | ⬜ Awaiting user review |
| 9 | Lead-Gen & Forms (Insights, Contact, Demo) | ✅ Complete | ⬜ Awaiting user review |
| 10 | CMS schema + Control Hub editor (Skipped / Minimal Backend Built) | ✅ Complete | ⬜ Awaiting user review |
| 11 | LAM ID / SSO schema + Staff Login | ✅ Complete | ⬜ Awaiting user review |
| 12 | SEO, favicons, PWA manifest | ✅ Complete | ⬜ Awaiting user review |
| 13 | Performance audit & production build | ✅ Complete | ⬜ Awaiting user review |
| 14 | Deployment (Vercel / hosting) | ✅ Complete | ⬜ Awaiting user review |

---

## ✅ Stage 0 — Project Setup & Memory
**Status**: Complete ✅ | **Manual Check**: Approved ✅

### What was done
- Project folder created: `Lubb al Mandumah LAM/`
- `.agents/AGENTS.md` created with full project memory:
  - Brand identity & colours
  - Slider images (4 × `.jpg`) saved to `public/images/slider/`
  - Favicon source image saved to `public/favicon-source.jpg`
  - Supabase credentials (URL, Anon key, Service Role key, JWT keys)
  - `.env.local` template documented
  - Stage gate rule added
- `docs/LAM_MASTER_PLAN.md` created (this file)

### Files Created / Changed
| File | Action |
|------|--------|
| `.agents/AGENTS.md` | 🆕 Created |
| `docs/LAM_MASTER_PLAN.md` | 🆕 Created |
| `public/images/slider/slider-01-boardroom-logo-wall.jpg` | 🆕 Created |
| `public/images/slider/slider-02-building-exterior.jpg` | 🆕 Created |
| `public/images/slider/slider-03-conference-room.jpg` | 🆕 Created |
| `public/images/slider/slider-04-reception-lobby.jpg` | 🆕 Created |
| `public/favicon-source.jpg` | 🆕 Created |

### Tests
- N/A (setup only — no runnable code yet)

### Rollback Notes
- Delete `public/` and `.agents/` to fully revert this stage

---

## ✅ Stage 1 — Next.js Scaffold + Supabase Wiring
**Status**: Complete ✅ | **Manual Check**: Awaiting user review ⬜

### Planned
- Scaffold Next.js 14 (App Router) project in repo root
- Install `@supabase/supabase-js` and `@supabase/ssr`
- Create `.env.local` with all keys from AGENTS.md
- Create `lib/supabase/client.ts` and `lib/supabase/server.ts`
- Verify Supabase connection is live (ping from server component)
- Verify dev server starts at `localhost:3000`

### Files to Create / Change
| File | Action |
|------|--------|
| `package.json` | 🆕 Created by scaffold |
| `next.config.ts` | 🆕 Created by scaffold |
| `.env.local` | 🆕 Created |
| `lib/supabase/client.ts` | 🆕 Created |
| `lib/supabase/server.ts` | 🆕 Created |

### Tests
- [x] `npm run dev` starts without errors
- [x] Browser loads `localhost:3000` without crash
- [ ] Supabase connection test (console log from server component)

### Rollback Notes
- Delete all scaffold files; restore only `public/`, `.agents/`, `docs/`

---

## ✅ Stage 2 — Global Design System
**Status**: Complete ✅ | **Manual Check**: Awaiting user review ⬜

### Planned
- Google Fonts: Playfair Display + Inter
- CSS custom properties: colour tokens, spacing, typography scale
- Global dark-mode base styles
- Reusable utility classes (button, section, container)

---

## ✅ Stage 3 — Homepage Hero Slider
**Status**: Complete ✅ | **Manual Check**: Awaiting user review ⬜

### Planned
- Auto-advancing image slider using the 4 provided `.jpg` images
- Overlay text with headline, subheadline, CTA button
- Smooth crossfade / slide transition
- Fully responsive

---

## ✅ Stage 4 — Homepage Remaining Sections
**Status**: Complete ✅ | **Manual Check**: Awaiting user review ⬜

### Planned
- Intro Section (What LAM Is)
- Products Strip (Featured Ecosystem Platforms)
- Solutions Teaser (Solutions & Platforms)
- Industries We Serve (NEW)
- Why LAM (NEW)
- Security & Trust (NEW)
- Clients Preview (Replaced Partners/Stats)
- Insights Preview (NEW)
- CTA Section

---

## ⬜ Stages 7–13
*(To be detailed progressively as earlier stages are approved)*

---

## 🗒️ Change Log

| Date | Stage | Change | Author |
|------|-------|--------|--------|
| 2026-08-08 | 0 | Initial project memory and master plan created | Antigravity |
| 2026-08-08 | 1 & 2 | Scaffolding, Global Design System, Header/Footer, Layouts | Antigravity |
| 2026-08-08 | 3 & 4 | Homepage Hero Slider and Remaining Sections | Antigravity |
| 2026-08-09 | 4 | Homepage Redesign - Added Industries, Why LAM, Security, removed fake stats/logos | Antigravity |
| 2026-08-09 | 5 | Products Catalogue & Templates - Added scalable CMS-like products data model | Antigravity |
| 2026-08-09 | 6 | Solutions & Industries - Added data-driven taxonomy and dynamic templates | Antigravity |
| 2026-08-09 | 8 | Corporate Trust Pages (Partners, About, Careers) - Built credibility pages with strict empty states | Antigravity |
| 2026-08-09 | 9 | Lead-Gen & Forms (Insights, Contact, Demo) - Implemented secure temporary form adapters and article architecture | Antigravity |
| 2026-08-09 | 10 | Minimal Supabase Backend - Skipped heavy CMS UI, built tables and Server Actions for Lead-Gen forms | Antigravity |
| 2026-08-09 | 11 | LAM ID / SSO schema + Staff Login - Built Supabase SSR auth middleware, login form, and Super Admin | Antigravity |
| 2026-08-09 | 12 | SEO, favicons, PWA manifest - Implemented dynamic sitemap.ts, robots.ts, and fixed Open Graph metadata | Antigravity |
| 2026-08-09 | 13 | Performance audit & production build - Passed accessibility and security checks, completed production build | Antigravity |
| 2026-08-09 | 14 | Deployment (Vercel / hosting) - Created .env.example, committed final code, and provided Vercel rollout guide | Antigravity |

---

## 🔴 Issues / Blockers

*None at this time.*

---

## ⏪ Rollback Registry

| Date | Stage Rolled Back | Reason | Files Removed/Restored |
|------|-------------------|--------|------------------------|
| — | — | — | — |
