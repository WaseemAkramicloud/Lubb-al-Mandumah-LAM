# Lubb al-Mandumah (LAM) — Project Rules & Memory

## ⚙️ Standing Development Rules
1. **Master Plan**: Always maintain `/docs/LAM_MASTER_PLAN.md` — log every completed stage, pending stage, changed files, test results, and rollback notes.
2. **Stage Gate**: Do NOT proceed to the next stage until the current stage has been built successfully AND manually checked/approved by the user.
3. **No silent skips**: If a stage fails a build or manual check, record the failure in the master plan and wait for instructions.
4. **No code imports from other projects**: Do NOT copy, import, or reuse any code from ATOM, AimHighSERP, MAAMS, or any other existing project. Each product is built from scratch when the user instructs it.
5. **Clean Supabase**: The LAM Supabase project (`ykrjmctfmywhymgpkqlu`) is a fresh database — do not reference or import schemas from any prior Supabase project (e.g. `jdbafogslyniwsmjnzrh`).
6. **Follow the user's pace**: The user drives stage execution via the LAM Zero-to-Hero Website Prompts handbook. Do NOT run ahead. Do NOT start a stage that has not been explicitly instructed. If uncertain about scope, ASK first.
7. **Build approach**: Start simple, keep the foundation extensible, add complexity only when it creates value.

## 🏛️ Architectural Non-Negotiables
These decisions are FINAL and must never be overridden without explicit user instruction:

| Rule | Detail |
|------|--------|
| **LAM role** | Parent company website + internal Control Hub. LAM is NOT an ERP. |
| **Core LAM SaaS** | ATOM, AimHighSERP, MAAMS (built fresh, one at a time, on user instruction) |
| **Portfolio products** | AMAL, PointO, mobile apps — LAM-owned, shown on public website, but their backends/auth/subscriptions are fully independent |
| **LAM ID scope** | Universal SSO for LAM staff + ALL current and future LAM-core SaaS products. Not limited to a named list. Any new product integrated into the LAM core automatically uses LAM ID. |
| **LAM Staff Login** | Only a discreet staff login on the public website. No client/product user login in public navigation. |
| **Client access** | Via private/direct product URLs after onboarding — NOT via public LAM nav. |
| **CMS** | All public website content editable by non-technical admins. No raw JSON/code editing. |
| **MAAMS** | Restricted product — diplomatic missions/approved institutions only. Not for open/public subscription. |


## Project Identity
- **Full Name**: Lubb al-Mandumah
- **Short Name / Acronym**: LAM
- **Folder**: `/Users/waseemakram/My Comp Data/Lubb al Mandumah LAM`
- **Brand Colors** (inferred from logo imagery): Dark charcoal/black (#0D0D0D), silver/steel metallic, warm gold accents (#C9A84C)

## Homepage Slider Images
Four high-quality branded images are provided for the homepage hero slider. They are stored at:

```
public/images/slider/
  slider-01-boardroom-logo-wall.jpg    → Dark boardroom, LAM logo on marble wall, flags
  slider-02-building-exterior.jpg      → Building exterior at dusk with LAM signage & flags
  slider-03-conference-room.jpg        → Wide conference room, LAM logo center wall, warm wood tones
  slider-04-reception-lobby.jpg        → Grand reception lobby, marble desk, LAM logo, gold flags
```

These images must be used (in order) as the hero/slider images on the website homepage.

## Favicon
The favicon source image is stored at:

```
public/favicon-source.jpg   → Reception lobby scene with LAM logo (used as favicon base)
```

When building the website, convert this image (crop to the LAM logo mark) and export as:
- `public/favicon.ico` (16×16, 32×32, 48×48)
- `public/favicon-192.png` (192×192, for PWA/Android)
- `public/apple-touch-icon.png` (180×180, for iOS)

## Design Direction
- Premium, dark, corporate aesthetic — consistent with the LAM brand imagery
- Colour palette: deep blacks, charcoal greys, silver metallic, warm gold accents
- Typography: modern serif/sans-serif mix (e.g. Playfair Display + Inter)
- Dark-mode first design

## Supabase Project

| Field | Value |
|-------|-------|
| Organization | Lubb al Manzumah |
| Project Owner | wa.seem@icloud.com |
| Project Name | Lubb-al-Mandumah-LAM |
| Project Password | 471817@Lam2026 |
| GitHub Repository | WaseemAkramicloud/Lubb-al-Mandumah-LAM |
| Project URL | https://ykrjmctfmywhymgpkqlu.supabase.co |
| Project ID | ykrjmctfmywhymgpkqlu |
| Data API URL | https://ykrjmctfmywhymgpkqlu.supabase.co/rest/v1/ |

### API Keys

| Key | Value |
|-----|-------|
| Publishable Key | sb_publishable_xOZolPoUeCAnh1LhNq0KaQ_RTi7AkL3 |
| Secret Key | <REDACTED> |

**Anon Public Key (Legacy):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcmptY3RmbXl3aHltZ3BrcWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxOTU4MDEsImV4cCI6MjEwMTc3MTgwMX0.8LCT2NbszsjiB0k7CRquzY6ywuFRqiQ2HFyAFSICljk
```

**Service Role Secret Key (Legacy):**
```
<REDACTED>
```

### JWT Keys

| Status | Key ID | Type |
|--------|--------|------|
| Current | DAADFAD3-12CD-4767-8C7E-526D6EA74A4E | ECC (P-256) |
| Previous | ED835817-8907-4EEA-9B16-D9854EAB7835 | Legacy HS256 (Shared Secret) |

**Legacy JWT Secret:**
```
kQuShGGksLgUI11Podv6L7gwagdsA9LO8yb5ligP1DLAbMbyZqlWG8wi8yTJC/pB8LjxAM6Y6TakY6ml1nck0A==
```

### Environment File (.env.local)
When scaffolding the project, create `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ykrjmctfmywhymgpkqlu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcmptY3RmbXl3aHltZ3BrcWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxOTU4MDEsImV4cCI6MjEwMTc3MTgwMX0.8LCT2NbszsjiB0k7CRquzY6ywuFRqiQ2HFyAFSICljk
SUPABASE_SERVICE_ROLE_KEY=<REDACTED>
SUPABASE_SECRET_KEY=<REDACTED>
```
