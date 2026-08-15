# LAM Web Control Panel — Master Log

> **AI ORIENTATION INSTRUCTION:**
> Before making any change, read this `LAM_WEB_CONTROL_PANEL_MASTER_LOG.md` and inspect the current code relevant to the requested change. Treat this master log as orientation, not as a substitute for verifying the actual code/database state. Make only the requested change, preserve established LAM Web Control Panel architecture and permission boundaries, run relevant checks, then update the CURRENT SOURCE OF TRUTH and append a dated maintenance entry to this same `LAM_WEB_CONTROL_PANEL_MASTER_LOG.md`. Do not create another progress/status Markdown file.

---

## 📌 CURRENT SOURCE OF TRUTH — READ THIS FIRST

This section summarizes the **DEFINITIVE live architecture** as of **Stage 15 (2026-08-15)**.

### 🌐 Production Custom Domains

| Domain / URL | Purpose & Architecture |
|---|---|
| `https://www.lubbalmandumah.com` | **Public LAM Corporate Website** (Dynamic Next.js App Router, CMS-driven). |
| `https://lubbalmandumah.com` | **Root Domain** (HTTP 308 permanent redirect to `www.lubbalmandumah.com`). |
| `https://staff.lubbalmandumah.com` | **LAM Staff Control Panel & Staff Login** (`/staff-login`, `/control-panel/*`). Strictly isolated staff host. |
| `https://id.lubbalmandumah.com` | **LAM ID / OAuth 2.0 / OIDC Authority** (`/id/*`, `/api/sso/*`, `/.well-known/*`). Universal identity authority. |
| `https://account.lubbalmandumah.com` | **LAM Customer Account Portal** (`/portal/*`). Customer workspace & product launcher. |
| `https://nexora.lubbalmandumah.com` | **NEXORA SaaS Application** (Independent Next.js application on separate Supabase project). |

---

### 🔑 Authentication & Authorization

1. **Canonical Authentication**:
   - Supabase Auth (`auth.users` in Supabase project `ykrjmctfmywhymgpkqlu`) is the **single canonical authentication provider**.
   - No custom password hashing tables or duplicate credential stores exist.

2. **Staff Authorization Context**:
   - `staff_profiles` linked via `auth_user_id` to Supabase Auth (`@lamweb.com` / staff work emails).
   - Granular permissions stored in `staff_permissions` (`leads_clients`, `site_management`, `user_management`, `audit_log`, `system_settings`).
   - Server-side interceptor `requirePermission(module, action)` enforces access.

3. **Customer Authorization Context**:
   - `customer_identities` linked via `auth_user_id` to Supabase Auth.
   - Multi-layered authorization check enforced via `lib/sso/sso-service.ts`:
     1. Active Customer Identity (`customer_identities.status = 'active'`)
     2. Active Company Membership (`customer_company_memberships.status = 'active'`)
     3. Active Company Product Subscription (`customer_product_entitlements.status = 'active'`)
     4. Explicit User Product Access Grant (`customer_product_access.status = 'active'`)

4. **Context Isolation**:
   - Staff and Customer application contexts remain strictly separate.
   - Staff login lives at `https://staff.lubbalmandumah.com/staff-login`.
   - Customer login lives at `https://id.lubbalmandumah.com/id/login`.

---

### 🛡️ OAuth 2.0 / OIDC & SSO Architecture

- **Protocol**: OAuth 2.0 / OpenID Connect (OIDC) Authorization Code Flow.
- **PKCE Requirement**: **S256 PKCE required** in production (plain method rejected).
- **Token Signing**: **RS256 (RSA-2048)** asymmetric signing (`lib/sso/jwt.ts`). Private RSA key owned strictly by LAM ID authority (`LAM_SSO_PRIVATE_KEY`).
- **JWKS Endpoint**: `https://id.lubbalmandumah.com/.well-known/jwks.json` (Exposes **public RSA key material only**: `kty: "RSA"`, `alg: "RS256"`, `kid: "lam-id-key-rs256-2026"`). Zero private keys or symmetric secrets exposed.
- **Production OIDC Issuer**: `https://id.lubbalmandumah.com`
- **Canonical NEXORA Callback**: `https://nexora.lubbalmandumah.com/api/auth/callback`
- **Inter-Service Communication**: HMAC SHA-256 request signatures, timestamp freshness validation (±300s window), and nonce replay protection (`inter_service_nonces`).

---

### 🗄️ Database Architecture

- **LAM Database**: Supabase Project `ykrjmctfmywhymgpkqlu` (URL: `https://ykrjmctfmywhymgpkqlu.supabase.co`).
- **NEXORA Database**: Independent Supabase Project (`nexora-nu-lime-63` backend).
- **Separation**: LAM and NEXORA databases remain 100% independent. No cross-database foreign keys, shared DB users, or direct SQL coupling.

---

### 🧭 Current Staff Control Panel Navigation & Canonical Routes

#### Primary Sidebar Groups (`components/layout/SidebarNav.tsx`):
- **`OVERVIEW`**: Dashboard (`/control-panel/dashboard`)
- **`BUSINESS`**: Clients (`/control-panel/clients`), Products & Subscriptions (`/control-panel/subscriptions`)
- **`WEBSITE`**: Website Management (`/control-panel/modules/site-management`)
- **`ADMINISTRATION`**: Staff Users (`/control-panel/users`), Audit Log (`/control-panel/audit`), System Settings (`/control-panel/modules/system-settings`), My Profile (`/control-panel/profile`)

#### Canonical Business Routes:
- `/control-panel/clients` — Central Clients Registry Hub
- `/control-panel/clients/new` — Staff-Controlled Client & Evaluation Onboarding
- `/control-panel/clients/[companyId]` — Client Control Centre (Overview, Users, Subscriptions, Workspace, Activity)
- `/control-panel/clients/users` — Client Users Directory
- `/control-panel/clients/requests` — Business Requests & Inquiries
- `/control-panel/subscriptions` — Products & Subscriptions Manager

> ⚠️ **LEGACY ROUTE NOTICE**: Legacy `/control-panel/modules/ecosystem/*` and `/control-panel/modules/leads-clients` URLs issue automatic 307 HTTP redirects in `next.config.ts` to their canonical `/control-panel/clients/*` equivalents. They are retained solely for backward compatibility.

---

### 🔒 Customer Registration & Onboarding

- **Public Self-Registration**: **DISABLED** (Invite-Only). Accessing `/id/register` without an invitation token renders an "Account Creation by Invitation Only" notice.
- **Client Onboarding**: Staff-controlled via `/control-panel/clients/new`. Supports creating Standard and Demo accounts, assigning seat limits, setting demo expiry, generating invite links or temporary passwords, and dynamically loading active SaaS products from `cms_products`.

---

## 🎯 CURRENT STATUS

- **Phase 1 (Foundation to Security Review)**: **Completed** (Stages 1–9)
- **Phase 2 (CMS Expansion & Global Configuration)**: **Completed** (Stages 1–6)
- **Phase 3 (Future-Proofing Products & CRM Foundations)**: **Completed** (2026-08-11)
- **Phase 4 (LAM ID, Central Identity, Customer Access & SSO Foundation — Hardened RS256)**: **Completed & Fully Verified** (2026-08-11)
- **Phase 5 (Invite-Only Registration & Staff-Controlled Customer Onboarding)**: **Completed & Verified** (2026-08-11)
- **Phase 6 (Production Custom Domain Migration to LubbAlMandumah.com, Host Routing & OIDC Issuer Alignment)**: **Completed & Live Verified** (2026-08-15)
- **Stage 13 (Customer Accounts Profile CRUD & Details 404 Resolution)**: **Completed & Verified** (2026-08-15)
- **Stage 14 (Control Panel Structure, Client Management & CMS Refinement)**: **Completed & Verified** (2026-08-15)
- **Stage 15 (Route Consolidation, Client Management & Legacy UI Stabilisation)**: **Completed & Verified** (2026-08-15)

---

## 📋 CURRENT OPERATIONAL CHECKLIST

The following checklist reflects the current live production status:

1. ✅ **Database Migrations**: Applied and verified (`20260810000005` through `20260811000003`). All tables, RLS policies, and triggers are active on Supabase project `ykrjmctfmywhymgpkqlu`.
2. ✅ **Production Environment Variables**: Configured on Vercel (`NEXT_PUBLIC_APP_URL`, `LAM_SSO_ISSUER`, `LAM_STAFF_BASE_URL`, `LAM_ID_BASE_URL`, `LAM_ACCOUNT_BASE_URL`, `NEXORA_BASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
3. ✅ **Host-Based Routing**: Active via `proxy.ts`. Host isolation verified over HTTPS across all 6 custom production domains.
4. ✅ **LAM ID / SSO Authority**: Live and operational using RS256 asymmetric signing. Automated test suite passed 12/12 security tests.
5. ✅ **Client Control Centre**: Operational at `/control-panel/clients/[companyId]`. Unicore Enterprises (`6c75683e-5dc4-45a6-b434-7b287f108460` / `COMP-912057`) verified live.
6. ✅ **Staff 404 Handler**: Active at `app/control-panel/not-found.tsx`. Retains staff layout and navigation.
7. ✅ **Superadmin Account Lock**: Initial Superadmin bootstrap locked. Additional staff management governed via `/control-panel/users`.

---

## ⚙️ ENVIRONMENT VARIABLES SUMMARY

Based on actual codebase inspection (`.env.local`, `next.config.ts`, `lib/sso/jwt.ts`, `lib/sso/nexora-client.ts`):

### 1. Required Production Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Public Supabase Project URL (`https://ykrjmctfmywhymgpkqlu.supabase.co`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public Supabase Anon JWT Key.
- `SUPABASE_SERVICE_ROLE_KEY`: Service Role Secret Key (Server-only, strictly hidden from browser).
- `NEXT_PUBLIC_APP_URL`: Primary Canonical Public URL (`https://www.lubbalmandumah.com`).
- `LAM_SSO_ISSUER`: Canonical OIDC Issuer URL (`https://id.lubbalmandumah.com`).
- `LAM_STAFF_BASE_URL`: Staff Control Panel URL (`https://staff.lubbalmandumah.com`).
- `LAM_ID_BASE_URL`: Identity Authority URL (`https://id.lubbalmandumah.com`).
- `LAM_ACCOUNT_BASE_URL`: Customer Account Portal URL (`https://account.lubbalmandumah.com`).
- `NEXORA_BASE_URL`: Production NEXORA Application URL (`https://nexora.lubbalmandumah.com`).

### 2. Optional Development / Override Variables
- `LAM_SSO_PRIVATE_KEY`: RSA-2048 Private Key for token signing (Auto-generated fallback used if omitted).
- `LAM_SSO_PUBLIC_KEY`: RSA-2048 Public Key for JWKS (Auto-derived from private key if omitted).
- `LAM_INTERSERVICE_SECRET`: HMAC secret for inter-service API signing (Vault secret fallback used if omitted).
- `NEXORA_PROVISIONING_URL`: Provisioning endpoint override (Defaults to `${NEXORA_BASE_URL}/api/inter-service/provisioning`).

### 3. Deprecated / Legacy Variables
- `LAM_SSO_JWT_SECRET`: *Deprecated*. Used during initial HMAC-SHA256 phase; superseded by RS256 RSA private key signing in Stage 10.
- `PORTAL_BASE_URL`: *Superseded* by `LAM_ACCOUNT_BASE_URL`.

---

## 🗄️ DATABASE MIGRATION STATUS TABLE

| Migration File | Purpose | Status |
|---|---|---|
| `20260810000005_crm_leads_clients.sql` | Unified leads (`crm_leads`), client notes (`crm_clients`), audit logs (`crm_audit_logs`). | **Applied & Verified** |
| `20260810000006_stage8.sql` | Dynamic pricing plans (`cms_pricing_plans`) & global settings (`system_settings`). | **Applied & Verified** |
| `20260810000007_stage9.sql` | Added `home_products` section to `cms_sections`. | **Applied & Verified** |
| `20260811000000_future_proof_products_crm.sql` | Product expansion columns, `crm_companies`, `crm_contacts`, `crm_company_products`. | **Applied & Verified** |
| `20260811000001_lam_id_sso.sql` | Central identity schema (`customer_identities`, `memberships`, `entitlements`, `sso_applications`). | **Applied & Verified** |
| `20260811000002_lam_sso_inter_service.sql` | Inter-service nonces (`inter_service_nonces`) & platform admins (`nexora_platform_admins`). | **Applied & Verified** |
| `20260811000003_demo_company_lifecycle.sql` | Added `company_type` to `crm_companies` and `expires_at` to `customer_product_entitlements`. | **Applied & Verified** |

---

## 🗺️ CURRENT ROUTE MAP

### 1. Staff Routes (`https://staff.lubbalmandumah.com`)
- `/staff-login` — Staff Authentication Login Page
- `/control-panel/dashboard` — Executive Metric Cards Dashboard
- `/control-panel/clients` — Central Clients Registry Hub
- `/control-panel/clients/new` — Onboard New Client / Evaluation Account
- `/control-panel/clients/[companyId]` — Individual Client Control Centre
- `/control-panel/clients/users` — Client Users Directory
- `/control-panel/clients/requests` — Business Requests & Inquiries
- `/control-panel/subscriptions` — Products & Subscriptions Manager
- `/control-panel/modules/site-management` — Page-by-Page Non-Technical Website CMS
- `/control-panel/users` — Staff User Administration
- `/control-panel/audit` — System Audit Log
- `/control-panel/modules/system-settings` — Global System Parameters
- `/control-panel/profile` — Staff User Profile Settings
- `/control-panel/not-found.tsx` — Staff 404 Error Handler (Retains Control Panel Layout)

### 2. LAM ID Routes (`https://id.lubbalmandumah.com`)
- `/id/login` — Customer Identity Login
- `/id/register` — Invite-Only Registration Handler
- `/id/forgot-password` — Customer Password Reset Request
- `/id/reset-password` — Customer Password Reset Confirmation
- `/id/invite/[token]` — Token Invitation Redemption Handler
- `/.well-known/openid-configuration` — OIDC Discovery Document
- `/.well-known/jwks.json` — Public RS256 JWKS Key Set
- `/api/sso/authorize` — OAuth 2.0 / OIDC Authorization Code Endpoint (S256 PKCE Enforced)
- `/api/sso/token` — Token Exchange Endpoint
- `/api/sso/userinfo` — OIDC UserInfo Endpoint
- `/api/sso/validate` — Token Verification Endpoint

### 3. Customer Account Portal Routes (`https://account.lubbalmandumah.com`)
- `/portal` — Customer Workspace & Product Launchpad
- `/portal/company` — Customer Company Profile
- `/portal/products` — Product Subscriptions Directory
- `/portal/team` — Team Access & Product Permissions Management
- `/portal/security` — Account Security Settings
- `/portal/profile` — User Profile Settings

### 4. Public Corporate Website Routes (`https://www.lubbalmandumah.com`)
- `/` — Homepage
- `/about`, `/about/careers` — Company Overview & Career Listings
- `/products`, `/products/[slug]` — Product Showcase
- `/solutions`, `/solutions/[slug]` — Business Solutions
- `/industries`, `/industries/[slug]` — Industry Verticals
- `/partners` — Partners & Alliances
- `/insights`, `/insights/[slug]` — Thought Leadership & Perspectives
- `/contact` — Global Contacts & Inquiries Form
- `/request-demo` — Platform Demo Request Form

### 5. Inter-Service API Endpoints
- `/api/inter-service/provisioning` — Outbound/Inbound HMAC Provisioning API
- `/api/inter-service/invitations` — Queue Redemption API
- `/api/inter-service/platform-admins` — Platform Administrator Management API

### 6. Legacy Compatibility Redirects (HTTP 307)
- `/control-panel/modules/ecosystem` ➔ Redirects to `/control-panel/clients`
- `/control-panel/modules/ecosystem/companies` ➔ Redirects to `/control-panel/clients`
- `/control-panel/modules/ecosystem/companies/new` ➔ Redirects to `/control-panel/clients/new`
- `/control-panel/modules/ecosystem/companies/:id` ➔ Redirects to `/control-panel/clients/:id`
- `/control-panel/modules/ecosystem/identities` ➔ Redirects to `/control-panel/clients/users`
- `/control-panel/modules/ecosystem/entitlements` ➔ Redirects to `/control-panel/subscriptions`
- `/control-panel/modules/leads-clients` ➔ Redirects to `/control-panel/clients/requests`
- `/control-panel/access` ➔ Redirects to `/control-panel/users`

---

## 📜 HISTORICAL STAGE LOGS

> ⚠️ **HISTORICAL NOTICE:** Historical entries below describe the system at the time each stage was implemented. Later stages supersede earlier architecture, URLs, authentication methods, routes, and deployment instructions. For current implementation decisions, always refer to the **CURRENT SOURCE OF TRUTH** above and verify actual code/database state.

---

### Stage 1: Foundation, Route Structure & Control-Panel Shell (2026-08-10)
1. **Current stage and status**: Completed.
2. **Implementation**: Built the foundational control panel shell under `/control-panel/*` using the existing work-email + password Supabase auth.
3. **User-visible routes**: `/control-panel/dashboard`, `/control-panel/users`, `/control-panel/profile`, `/control-panel/settings`.
4. **Important files**: `app/control-panel/layout.tsx`, `components/Sidebar.tsx`, `components/TopBar.tsx`.
5. **Database changes**: None required in this initial shell stage.
6. **Decisions**: Preserved the existing Supabase project and Superadmin auth flow.
7. **Checks**: Passed Next.js build.
8. **Next Step**: Stage 2 (User Management).

### Stage 2: Staff Users, Company Email Generation & User Management (2026-08-10)
1. **Current stage and status**: Completed.
2. **Implementation**: Built `staff_profiles` management for Superadmins with automatic `@lamweb.com` email generation.
3. **User-visible routes**: `/control-panel/users`, `/control-panel/users/create`, `/control-panel/users/[id]/edit`.
4. **Important files**: `lib/actions/users.ts`.
5. **Database changes**: Created `staff_profiles` table mapping to Supabase Auth users.
6. **Decisions**: Handled staff ID format (`LAM-000001`).
7. **Checks**: Verified user creation and sync flow.
8. **Next Step**: Stage 3 (Roles & Permissions).

### Stage 3: Roles, Permissions & Drag-and-Drop Access Builder (2026-08-10)
1. **Current stage and status**: Completed.
2. **Implementation**: Built the Permission builder matrix.
3. **User-visible routes**: `/control-panel/users/[id]/permissions` (integrated in edit).
4. **Database changes**: Added `staff_permissions` table and `audit_logs` tracking.
5. **Decisions**: Strict server-side permission checks using `requirePermission()`.
6. **Checks**: Permissions properly block unauthorized routes.
7. **Next Step**: Stage 4 (Dashboard & Profile).

### Stage 4: Dashboard, My Profile & Settings (2026-08-10)
1. **Current stage and status**: Completed.
2. **Implementation**: Built the widget-based drag/drop dashboard and the user profile editing pages.
3. **User-visible routes**: `/control-panel/dashboard`, `/control-panel/profile`, `/control-panel/settings`.
4. **Database changes**: Added `staff_settings` table to save layout/theme preferences.
5. **Decisions**: Widgets check permissions before displaying.
6. **Checks**: Verified drag-and-drop state updates.
7. **Next Step**: Stage 5 (Site Management CMS).

### Stage 5: Site Management CMS: Page Cards & Sections (2026-08-10)
1. **Current stage and status**: Completed.
2. **Implementation**: Built the visual Site Management CMS for editing public pages.
3. **User-visible routes**: `/control-panel/modules/site-management`.
4. **Database changes**: Added `cms_pages` and `cms_sections`.
5. **Decisions**: Connected the public `/` homepage to dynamic CMS fetch with safe static fallbacks.
6. **Checks**: Build passed without hydration errors.
7. **Next Step**: Stage 6 (Products & Insights CMS).

### Stage 6: Products, Insights & Remaining Content Modules (2026-08-10)
1. **Current stage and status**: Completed.
2. **Implementation**: Fully moved Products, Insights, Solutions, Industries, Careers, and Media Library to database.
3. **Database changes**: Added `cms_products`, `cms_insights`, `cms_collections`, `media_assets`.
4. **Decisions**: Implemented async getters with try/catch fallbacks to the hardcoded config arrays to prevent production crashes on missing DB rows. 
5. **Checks**: Verified dynamic metadata generation and page static builds.
6. **Next Step**: Stage 7 (Leads & CRM).

### Stage 7: Leads & Clients Lightweight CRM (2026-08-10)
- **Status**: Completed
- **Changes**:
  - Implemented database schema (`20260810000005_crm_leads_clients.sql`) adding `crm_leads`, `crm_clients`, and `crm_audit_logs`.
  - Added backfill migration logic for `contact_requests` and `demo_requests` into the new unified `crm_leads` table.
  - Refactored `lib/actions/forms.ts` to natively dual-write new public website requests to both the original request tables (for pure preservation) and the `crm_leads` system.
  - Built out `/control-panel/modules/leads-clients/page.tsx` for visual tracking and filtering of unified leads.
  - Built out the Lead Details page `[id]/page.tsx` with assignment, status tagging (New, Contacted, Qualified, Proposal, Converted, Closed/Lost), internal noting, and client-conversion.
  - Built out the Client Profiles repository `clients/page.tsx` for keeping lightweight notes on successfully converted leads.
  - Updated the Staff Dashboard to include three CRM specific widgets (`MyLeadsWidget`, `FollowUpsWidget`, `LeadsWidget`), dynamically rendered conditionally based on `leads_clients` user permission assignments.
- **Checks**: Ran `npm run build` which succeeded. The CRM adheres strictly to the existing server-side permission checks.
- **Next Step**: Stage 8 (Pricing, Audit, System Settings).

### Stage 8: Pricing & Plans, Audit Log & Superadmin System Controls (2026-08-10)
- **Status**: Completed
- **Changes**:
  - Implemented database schema (`20260810000006_stage8.sql`) adding `cms_pricing_plans` and `system_settings` tables, seeded with initial setup parameters.
  - Developed the **Pricing & Plans Module** (`/control-panel/modules/pricing`) allowing for Draft/Publish workflows decoupled entirely from standard Products editing permissions.
  - Developed a comprehensive, append-only **Audit Log** (`/control-panel/audit`) displaying the unified `audit_logs` table.
  - Retooled `lib/actions/users.ts` and `lib/actions/crm.ts` to push sensitive, redacted actions to the centralized Audit logger.
  - Developed the **System Settings** Superadmin interface (`/control-panel/modules/system-settings`) for safely configuring global constants like SEO defaults and Company Information, physically separated from user-specific interface settings.
  - Updated the unified Navigation Sidebar layout (`app/control-panel/layout.tsx`) to map and conditionally restrict routing to these highly sensitive modules.
- **Checks**: Ran `npm run build` safely verified statically. RLS policies implemented blocking sub-Superadmin levels from reading sensitive global constants.
- **Next Step**: Stage 9 (Final Security & Handover).

### Stage 9: Final Security Review, QA, Production Readiness & Handover (2026-08-10)
- **Status**: Completed
- **Changes**:
  - Implemented strict Suspended User bypass checks natively within the `requirePermission` and `ensureSuperadmin` server interceptors.
  - Added fail-safes preventing Superadmins from accidentally suspending themselves via the UI.
  - Hardened `lib/supabase/admin.ts` with Next.js `server-only` to guarantee the Service Role key can never be accidentally imported into a client bundle.
  - Fixed Next.js build and purity warnings (e.g. `Date.now()`).
- **Checks**: Final `npm run build` and `npm run lint` validated successfully.
- **Next Step**: Control Panel development is concluded. Await final sign-off.

---

### Phase 2: CMS Expansion & Global Configuration (2026-08-10)

#### Stage 1: Full Website Content Audit & CMS Blueprint (2026-08-10)
- **Status**: Completed
- **Changes**:
  - Performed a comprehensive technical and content audit of every public route (`/`, `/about`, `/partners`, `/contact`, `/products`, etc.).
  - Documented internal content inventory, mapping Page → Section → Component → Content → CMS Schema.
  - Identified master/reusable entities (`cms_products`, `cms_insights`, `cms_collections`) and validated their existing implementations.
  - Established a plan for Global Website Content (Header, Footer, Global SEO).

#### Stage 2: CMS Data Model & Content Migration (2026-08-10)
- **Status**: Completed
- **Changes**:
  - Maintained structure of existing `cms_sections` table (`content_schema`, `draft_content`, `published_content`).
  - Migrated hardcoded UI text into `published_content`.
  - Refactored frontend React components to use `getCmsPage(slug)`.

#### Stage 3: Rebuild Site Management Page & Page/Section Navigation (2026-08-10)
- **Status**: Completed
- **Changes**:
  - Replaced generic `cms_pages` loop in `Site Management` with a curated mapping of core public pages.
  - Enhanced Site Management landing page UI to leverage LAM dark/gold aesthetic.

#### Stage 4: Component-Specific Editors + Media Library Integration (2026-08-10)
- **Status**: Completed
- **Changes**:
  - Built `MediaPicker` UI component and `getMediaAssets` server action to integrate Media Library directly into CMS editor.
  - Refactored `CmsEditForm.tsx` with reordering controls for repeatable arrays.

#### Stage 5: Master Content Modules & Website References (2026-08-10)
- **Status**: Completed
- **Changes**:
  - Confirmed Products Module handles all detail JSON requirements.
  - Created Solutions and Industries modules bound to `cms_collections` table.
  - Rebuilt Homepage's `ProductsStrip.tsx` to accept dynamic CMS data.

#### Stage 6: Editorial Workflow, Security & Production Validation (2026-08-10)
- **Status**: Completed
- **Changes**:
  - Implemented server-side Draft and Publish routines for content modules.
  - Connected `previewUrl` dynamically into forms. Enforced server-side permission checks on publishing.

---

### Phase 3: Future-Proofing Products & CRM Foundations (2026-08-11)
- **Status**: Completed
- **Changes**:
  - Applied migration `20260811000000_future_proof_products_crm.sql` extending `cms_products`, creating `crm_companies`, `crm_contacts`, `crm_company_products`.
  - Added product expansion fields, company deduplication, company registry (`/control-panel/modules/leads-clients/companies`), and Product Portfolio widget.

---

### Phase 4: LAM ID, Central Identity, Customer Access & SSO Foundation (2026-08-11)
- **Status**: Completed & Verified.

> ⚠️ **SUPERSEDED BY STAGE 10:** The initial SSO implementation in this stage used symmetric HMAC-SHA256 (`LAM_SSO_JWT_SECRET`) and temporary placeholder domains (`https://lam.com`). Stage 10 upgraded signing to RS256 asymmetric signing, public JWKS key exposure, and production custom domain alignment (`https://id.lubbalmandumah.com`).

- **What was implemented initially**:
  - Applied migration `20260811000001_lam_id_sso.sql` creating 10 central identity & SSO tables.
  - Implemented OAuth 2.0 / OIDC authorization engine, single-use token exchange, UserInfo, JWKS, and central customer identity UI (`/id/login`, `/id/register`, `/portal`).

---

### Stage 10 (Phase 4 Hardening): RS256 Asymmetric Signing, Canonical Auth & Provisioning Direction (2026-08-11)
- **Status**: Completed & Fully Verified.
- **What was implemented**:
  - **RS256 Asymmetric Signing**: Upgraded token signing from HMAC-SHA256 to RS256 (RSA-2048) in `lib/sso/jwt.ts`.
  - **Public JWKS**: Updated `/.well-known/jwks.json` to expose ONLY public RSA key material (`kid: "lam-id-key-rs256-2026"`).
  - **Canonical Supabase Auth**: Linked `customer_identities` directly to `auth.users` via `auth_user_id`.
  - **S256 PKCE Enforcement**: Enforced `code_challenge_method = S256` in production mode.
  - **Hardened Superadmin Bootstrap**: Locked `scripts/bootstrap-superadmin.ts` permanently once a Superadmin exists. Removed obsolete `--force` flag.
  - **Outbound Provisioning Client**: Built `lib/sso/nexora-client.ts` to execute HMAC-signed provisioning calls from LAM to NEXORA.
  - **Security Test Suite**: Passed 12/12 security criteria in `scripts/test-lam-sso-foundation.ts`.

---

### Stage 11: Deployed Access Correction, Invite-Only Registration & Staff-Controlled Customer/Demo Onboarding (2026-08-11)
- **Status**: Completed & Verified.
- **What was implemented**:
  - **Superadmin Account Verification**: Confirmed Superadmin `admin@lamweb.com` in Supabase Auth. Verified live sign-in.
  - **Invite-Only Registration**: Restricted public `/id/register` with invite-only guard notice.
  - **Staff-Controlled Customer & Demo Onboarding**: Built `onboardCustomerCompanyAction` and onboarding UI at `/control-panel/modules/ecosystem/companies/new`. Supports Standard and Demo accounts (e.g., Unicore Enterprises demo preset button).
  - **Demo Lifecycle & Expiry**: Added `company_type` and `expires_at` support via migration `20260811000003_demo_company_lifecycle.sql`. Added inline **Suspend** / **Reactivate** controls.

---

### Stage 12: Production Custom Domain Migration to LubbAlMandumah.com, Host Routing & OIDC Issuer Alignment (2026-08-15)
- **Status**: Completed & Live Verified.
- **What was implemented**:
  - **Host Routing (`proxy.ts`)**: Next.js 16 host routing separating `www.lubbalmandumah.com`, `staff.lubbalmandumah.com`, `id.lubbalmandumah.com`, `account.lubbalmandumah.com`, `nexora.lubbalmandumah.com`.
  - **OIDC Issuer Alignment**: Aligned OIDC issuer to `https://id.lubbalmandumah.com`.
  - **NEXORA Callback Registration**: Registered `https://nexora.lubbalmandumah.com/api/auth/callback` in Supabase.
  - **Live Verification**: `curl` HTTPS checks verified 200 OK on JWKS/OIDC endpoints and 308 redirect from root domain to www.

---

### Stage 13: Customer Accounts Profile CRUD Completion & Details 404 Resolution (2026-08-15)
- **Status**: Completed & Live Verified.
- **What was implemented**:
  - **404 Resolution & Profile Route**: Created dynamic route `/control-panel/modules/ecosystem/companies/[id]`.
  - **Customer Profile**: Overview, Primary Owner, Subscriptions, Tenant Instances, Explicit User Access Grants, Activity Log.
  - **Edit Modal (`EditCompanyModal.tsx`)**: Built modal and `updateCompanyDetailsAction` to update company details without duplicate records.

---

### Stage 14: Control Panel Structure, Client Management & CMS Refinement (2026-08-15)
- **Status**: Completed & Live Verified.
- **What was implemented**:
  - **Sidebar Restructuring (`SidebarNav.tsx`)**: Grouped navigation into `OVERVIEW`, `BUSINESS`, `WEBSITE`, `ADMINISTRATION`.
  - **Executive Dashboard**: Updated dashboard with 6 high-level metric cards.
  - **Central Clients Hub**: Rebuilt landing page with sub-tabs (*Existing Clients*, *Onboard New Client*, *Client Users*, *Requests / Leads*).
  - **Proportional Safe Editing**: Enforced `Edit → Review Changes (Current Value ➔ New Value) → Confirm Update` modal workflow.
  - **Onboarding Summary Step**: Added **Review New Client Setup** step in `OnboardingForm.tsx`.
  - **CMS Publishing Workflow**: Visual page section cards with `Edit → Preview/Review → Publish to Live Site`.

---

### Stage 15: Route Consolidation, Client Management & Legacy UI Stabilisation (2026-08-15)
- **Status**: Completed & Live Verified.
- **What was implemented**:
  - **Root Cause Fix for Manage → 404**: Identified and fixed Postgres error `42703` caused by selecting non-existent `email` column from `staff_profiles` in `app/control-panel/modules/ecosystem/companies/[id]/page.tsx`. Allowed Unicore Enterprises (`6c75683e-5dc4-45a6-b434-7b287f108460` / `COMP-912057`) and all existing company profiles to resolve cleanly.
  - **Staff Control Panel 404 Handler**: Created `app/control-panel/not-found.tsx` rendering inside Control Panel layout with `← Back to Clients` and `Go to Dashboard` navigation (preventing fallback to public website 404).
  - **Canonical Business Routes Established**: Created `/control-panel/clients`, `/control-panel/clients/new`, `/control-panel/clients/[companyId]`, `/control-panel/clients/users`, `/control-panel/clients/requests`, and `/control-panel/subscriptions`.
  - **Legacy Route Redirection**: Added 307 redirects in `next.config.ts` mapping legacy `/control-panel/modules/ecosystem/*` and `/control-panel/modules/leads-clients` URLs to canonical business routes.
  - **Dynamic Onboarding Product Registry**: Updated `OnboardCustomerPage` (`companies/new/page.tsx`) to dynamically load active SaaS products from `cms_products` table (`lifecycle_status = 'Active'`) instead of hardcoding HTML options.
  - **Verification**: `npm run build` compiled with exit code 0 across 100 routes. `npx tsx scripts/test-lam-sso-foundation.ts` passed 12/12 security tests (100%). Pushed commit `1d09fe6` to GitHub.

---

### Stage 16: Customer Identity Provisioning, Account Access Setup & NEXORA Integration (2026-08-15)
- **Status**: Completed & Verified.
- **What was implemented**:
  - **Canonical Login & Terminology**: Primary Owner Work Email is canonical LAM ID login identifier. Updated user-facing terminology to **Company Owner**.
  - **Onboarding Access Setup (Options A & B)**:
    - Option A (Temporary Credentials): Generates strong temporary password server-side, flags `must_change_password: true` in user metadata, displays credentials on secure completion screen with `[Reveal]` and `[Copy Login Details]`.
    - Option B (Secure Setup Link): Generates single-use secure setup link with `[Copy Setup Link]`.
  - **Existing Identity Protection**: Reuses existing Auth & customer identities when adding new memberships. Never automatically resets existing passwords.
  - **Mandatory First-Login Password Change**: Built `/id/force-password-change` page and `completeFirstPasswordChange` action. Preserves OAuth pending authorization state in secure HTTP-Only `lam_pending_pwd_change` session cookie.
  - **Client Detail Page Enhancements**: Added explicit human-readable access status badges (Company, Entitlement, Tenant, Identity, Explicit Product Access, Password Status), seat usage calculation (1 of N seats used by Company Owner), and `AdminOwnerActions` for issuing temporary passwords with global impact warning.
  - **Public Sign-In Page Wording**: Updated `/id/login` footer text to `LAM ID accounts are created through authorised LAM onboarding.`
  - **Verification Testing**: Tested all 3 scenarios:
    1. **Unicore Enterprises (Repair)**: Verified owner identity (`waazimrana@gmail.com`), membership, entitlement, tenant, and explicit NEXORA access grant.
    2. **Purembil Fresh Onboarding (NEW Identity)**: Verified atomic creation of `Ayesha Siddiqua` (`ayesha@purembil.com`), temporary password login, forced password update, and clearance of `must_change_password` flag.
    3. **Purembil (Existing Identity)**: Verified adding existing identity to a second company (`Purembil Logistics`) while preserving existing login credentials untouched.
  - **Build Verification**: `npm run build` passed cleanly across 61 routes with 0 errors.
