# LAM Web Control Panel — Master Log

> **AI ORIENTATION INSTRUCTION:**
> Before making any change, read this `LAM_WEB_CONTROL_PANEL_MASTER_LOG.md` and inspect the current code relevant to the requested change. Treat this master log as orientation, not as a substitute for verifying the actual code/database state. Make only the requested change, preserve established LAM Web Control Panel architecture and permission boundaries, run relevant checks, then update the CURRENT SOURCE OF TRUTH and append a dated maintenance entry to this same `LAM_WEB_CONTROL_PANEL_MASTER_LOG.md`. Do not create another progress/status Markdown file.

---

## 📌 CURRENT SOURCE OF TRUTH — LAM CENTRAL IDENTITY & ACCESS ARCHITECTURE

This section summarizes the **DEFINITIVE live architecture** as of **Stage G (2026-08-19)**.

### 🌐 Canonical Production Custom Subdomains

| Subdomain / URL | Purpose & Architecture |
|---|---|
| `https://www.lubbalmandumah.com` | **Public Corporate Website** (Dynamic Next.js App Router, CMS-driven marketing & product portfolio). |
| `https://lubbalmandumah.com` | **Root Domain** (HTTP 308 permanent redirect to `www.lubbalmandumah.com`). |
| `https://staff.lubbalmandumah.com` | **LAM Staff Control Panel & Staff Login** (`/staff-login`, `/control-panel/*`). Staff-only host for onboarding and client management. |
| `https://id.lubbalmandumah.com` | **LAM Central Identity & OIDC Authority** (`/id/*`, `/api/sso/*`, `/.well-known/*`). Universal OAuth 2.0 / OIDC provider using RS256 asymmetric signing. |
| `https://access.lubbalmandumah.com` | **LAM Access Web Hub & Owner Console** (`/portal/*`). Universal login hub for Company Owners & workspace launcher. |
| `https://nexora.lubbalmandumah.com` | **NEXORA SaaS Application** (`lam_sso` product workspace target). |
| `https://atom.lubbalmandumah.com` | **ATOM SaaS Application** (`lam_sso` product workspace target). |
| `https://aimhighserp.lubbalmandumah.com` | **AimHighSERP SaaS Application** (`lam_sso` product workspace target). |
| `https://maams.lubbalmandumah.com` | **MAAMS SaaS Application** (`lam_sso` product workspace target, restricted). |

---

### 🏛️ Core Identity, Access & Provisioning Architecture

1. **Customer Account Hierarchy (Stage B)**:
   $$\text{Customer Account } (\text{LAM-CA-XXXXXX}) \longrightarrow \text{Organizations } (\text{LAM-ORG-XXXXXX}) \longrightarrow \text{Product Workspaces } (\text{PPPXXXX}) \longrightarrow \text{Workspace Memberships}$$
   - **`lam_customer_accounts`**: Commercial entity paying for subscriptions.
   - **`lam_organizations`**: Operational business units / legal entities under a customer account.
   - **`lam_product_workspaces`**: Specific product workspace instances with assigned **Workspace Code** (`PPPXXXX`), plan tier, and max seat limits.

2. **Dual Authentication Engine (Stage C)**:
   - **Company Owner Authentication**: Work Email + Password $\rightarrow$ Authenticates global owner identity (`customer_identities`) $\rightarrow$ Resolves full Customer Account hierarchy on **LAM Access** (`https://access.lubbalmandumah.com`).
   - **Workspace Employee Authentication**: `Workspace Code` + `User ID` + `Password` $\rightarrow$ Authenticates workspace-scoped identity $\rightarrow$ Scoped to assigned product workspace on child SaaS application (`https://<product>.lubbalmandumah.com`).
   - **Internal Auth Alias Filtering**: Synthetic email aliases (`${user_id}.${workspace_code}@users.lam.internal`) are encapsulated 100% server-side and **NEVER** exposed as `email` in tokens, UserInfo responses, or UI screens.

3. **Independent Workspace Credential Identities per Physical Person**:
   - A physical human can hold multiple independent workspace login accounts across different companies/workspaces.
   - Each workspace account receives its own `customer_identities.id`, its own `auth.users.id`, its own password, and its own workspace-scoped user ID.
   - Credentials, password resets, and account suspensions remain strictly unmerged and independent.

4. **Central Product Registry & Identity Modes**:
   - **`lam_sso` Products** (`NEXORA`, `ATOM`, `AimHighSERP`, `MAAMS`): Fully integrated into central SSO and workspace provisioning.
   - **`local_platform` Products** (`PointO`, `AMAL`): Operate independently outside central SSO. Displayed on public website, but excluded from central workspace provisioning.

5. **Minimal Workspace-Scoped OIDC Token Contract (Stage E)**:
   - Tokens contain ONLY minimal required claims (`sub`, `iss`, `aud`, `workspace_id`, `workspace_code`, `product`, `workspace_role`, `organization_id`, `email`, `given_name`, `family_name`, `nonce`, `exp`, `iat`, `jti`).
   - Token signing uses RS256 asymmetric private key with JWKS verification endpoint (`https://id.lubbalmandumah.com/.well-known/jwks.json`). Fail-closed in production mode.

6. **Inter-Service API Provisioning & Zero Cross-Database Writes**:
   - Provisioning operations communicate exclusively via HMAC-SHA256 signed inter-service REST endpoints (`/api/inter-service/provisioning` and `/api/inter-service/workspaces`).
   - No cross-database direct writes or shared database schemas between LAM and child SaaS products.

7. **Future Native Desktop App & Launcher Compatibility**:
   - The standard PKCE S256 Authorization Code flow (`/api/sso/authorize` $\rightarrow$ `/api/sso/token`) is 100% compatible with future native desktop apps and launchers via loopback redirect URIs (`http://127.0.0.1:<port>/callback`) or custom URI schemes.
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
- **Stage B / Stage 19 (Central Identity & Control Plane Database Foundation)**: **Completed & Verified** (2026-08-19)
- **Stage C / Stage 20 (Central Identity Engine & Dual Authentication Resolution)**: **Completed & Verified** (2026-08-19)
- **Stage D / Stage 21 (LAM Access Web Hub, Owner Console & Strict Access Isolation)**: **Completed & Verified** (2026-08-19)
- **Stage E / Stage 22 (Product Identity Contract, Token Claims & Multi-Client OIDC)**: **Completed & Verified** (2026-08-19)
- **Stage F / Stage 23 (Control Panel Client Onboarding & Credentials Management)**: **Completed & Verified** (2026-08-19)
- **Stage G / Stage 24 (Real-Domain End-to-End Acceptance & Operational Sign-Off)**:
  - **AUTOMATED STAGE G ACCEPTANCE**: PASSED
  - **SYNTHETIC DATA CLEANUP**: PASSED
  - **PRODUCTION BUILD**: PASSED
  - **FINAL SAFARI VISUAL/INTERACTIVE ACCEPTANCE**: PENDING MANUAL USER VERIFICATION

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

---

### Stage 17: Client Lifecycle Action Controls & List View Status Filters (2026-08-15)
- **Status**: Completed & Verified.
- **What was implemented**:
  - **Client Action Controls (`ClientLifecycleActions.tsx`)**: Prominent action card on Client Detail page rendering `Suspend Client` / `Reactivate Client`, `Archive Client`, and red danger `Delete Client` button.
  - **Suspend & Reactivate**: `suspendClientAction` & `reactivateClientAction` set company status to `Suspended` / `Active`, update entitlement & access statuses, and send deprovisioning notice to NEXORA while preserving all records.
  - **Archive**: `archiveClientAction` sets company status to `Archived`, removes normal customer access, and moves client to Archived view.
  - **Delete Modal & Verification**: Superadmin-only danger modal requiring administrator to type exact Company Name or Company Code before enabling `Permanently Delete`. Includes summary of Owner, Products, Users, and Tenants.
  - **Shared Identity Preservation**: `Also delete orphaned LAM ID` checkbox defaults to **OFF**. If primary owner or member belongs to another organization, shared Auth identity & customer record are preserved.
  - **NEXORA Inter-Service Deprovisioning**: Extended `notifyNexoraProvisioning` in `lib/sso/nexora-client.ts` to support `action: 'archive'` and `'delete'`.
  - **List View Status Filters**: Added status filter bar (`Active Clients | Suspended | Archived | All Clients`) to `/control-panel/clients`.
  - **Audit Logging**: Recorded events in `customer_audit_logs` (`client_suspended`, `client_reactivated`, `client_archived`, `permanent_deletion_initiated`, `permanent_deletion_completed`, `orphaned_identity_deleted`, `external_saas_deprovisioned`).
  - **Verification**: Tested lifecycle suite on synthetic test client via `scripts/test-client-lifecycle.ts`. `npm run build` compiled cleanly with 0 errors.

---

### Stage 18: Client User Management Controls & Initial Password Model (2026-08-15)
- **Status**: Completed & Verified.
- **What was implemented**:
  - **Explicit LAM ID Field**: Added clearly labeled `LAM ID / Login Email` field in Onboarding Form step 1 with helper text explaining that Primary Owner Work Email is the canonical sign-in identity.
  - **Review Screen Login Details**: Added `Company Owner Login Details` section in Review Step displaying Owner Name, LAM ID Email, Login URL (`https://id.lubbalmandumah.com`), Initial Password generation notice, optional password change note, role, and products.
  - **Initial Password Model**: Replaced "Temporary Password" with **Initial Password** terminology. Default: `must_change_password = false` (password change is optional for the user, not forced by default).
  - **Completion Screen Display**: Added `LAM ID Login Details` card displaying Login URL, LAM ID Email, Initial Password with `Reveal`, `Copy Password`, and `Copy Login Details` buttons.
  - **Existing LAM ID Rule**: If entered email matches an existing LAM ID, displays `Existing LAM ID detected — existing login credentials will remain unchanged` without resetting existing credentials.
  - **Client Users Directory Enhancements (`IdentitiesClient.tsx`)**:
    - Filter tabs: `Active Users | Archived Users | Unassigned Users | All Users` with live badge counts.
    - Actions per user: `View User`, `Archive User` / `Restore User`, `Delete User`.
    - **Safe Delete User Confirmation Modal**: Superadmin-only danger modal requiring typing exact LAM ID / Email before enabling `Permanently Delete User`.
    - **Safe Delete Enforcement**: If user still belongs to active client organization(s), deletion is BLOCKED with a clear explanation (`This LAM ID is still associated with one or more client organizations...`).
  - **Client User Detail Page (`/control-panel/clients/users/[id]`)**:
    - Full profile detail view with identity status, linked Auth UUID, last login date, organization memberships, and product access grants.
    - Action buttons: `Archive User` / `Restore User`, `Reset / Issue New Password` (generates new password, shows once with `Reveal`/`Copy`, logs audit event), `Remove From Company`, `Delete User`.
  - **Read-Only Audit**: Performed read-only audit of remaining database records (`scripts/audit-remaining-client-users.ts`), identifying 4 unassigned/orphaned identities without altering data.
  - **Audit Logging**: Recorded events in `customer_audit_logs` (`customer_user_archived`, `customer_user_restored`, `customer_user_password_reset`, `customer_user_membership_removed`, `customer_user_deletion_blocked`, `customer_user_deleted`).
  - **Verification & Build**: Tested synthetic user management via `scripts/test-client-user-controls.ts`. `npm run build` compiled cleanly with 0 errors across 63 routes.

---

### Stage B: Central Control Plane Database & Domain Model Foundation (2026-08-19)
- **Status**: Completed & Verified.
- **What was implemented**:
  - **Central Product Registry (`lam_products`)**: Created table and populated canonical SaaS products with workspace prefixes (`NEXORA` → `NEX`, `ATOM` → `ATO`, `AimHighSERP` → `AHS`, `MAAMS` → `MAA`, `PointO` → `POI`, `AMAL` → `AMA`).
  - **LAM Customer Accounts (`lam_customer_accounts`)**: Created commercial client account table with human-readable account code sequence (`LAM-CA-000001`).
  - **LAM Organizations (`lam_organizations`)**: Created operational business unit table with organization code sequence (`LAM-ORG-000001`).
  - **LAM Product Workspaces (`lam_product_workspaces`)**: Created product workspace table (`one organization + one product`) with `PPPXXXX` workspace code generator (4 random uppercase alphanumeric characters excluding ambiguous `O`, `0`, `I`, `1`, `L`) and case-insensitive unique constraint on `LOWER(workspace_code)`.
  - **LAM Workspace Memberships (`lam_workspace_memberships`)**: Created user workspace membership table mapping `LAM User UUID` (`customer_identities.id`) to product workspaces with scoped `user_id` and role (`owner`, `admin`, `member`), enforcing case-insensitive uniqueness on `(workspace_id, LOWER(user_id))`.
  - **Additive Schema & Coexistence**: Added `customer_account_id` & `organization_id` FKs to `crm_companies`, and `workspace_id` FKs to `customer_product_entitlements`, `customer_product_instances`, and `customer_product_access`. Zero legacy tables dropped. Zero existing UUIDs or passwords altered.
  - **Post-Migration Integrity Verification**: Applied migration `20260819000001_lam_central_identity_control_plane.sql` directly to Supabase production host `aws-1-eu-west-1.pooler.supabase.com:6543`. Reloaded PostgREST schema cache.
  - **Functional & Integrity Testing**: Executed `scripts/test-stage-b-integrity.ts` verifying multi-organization customer accounts, workspace code generation, case-insensitive collision rejection, global owner identity mapping, and clean synthetic data cleanup.
  - **Production Build Verification**: `npm run build` compiled 100% cleanly across all 101 routes with 0 errors.
- **Rollback / Recovery Approach**: Migration is 100% additive DDL with `IF NOT EXISTS` guards. Rollback (if ever required) involves dropping new tables (`lam_workspace_memberships`, `lam_product_workspaces`, `lam_organizations`, `lam_customer_accounts`, `lam_products`) and removing additive FK columns. Legacy tables remain completely untouched.
- **Proposed Stage C Authentication Design**:
  - Implement dual-entry authentication resolution in `lib/actions/customer-auth.ts`:
    - Entry 1 (Owner Access): `Email / User ID` + `Password`.
    - Entry 2 (Employee Workspace Access): `Workspace Code` + `User ID` + `Password`.
  - Create server-side identity resolver function `resolveWorkspaceUserIdentity(workspaceCode, userId)` returning linked `LAM User UUID` and credentials context.
  - Perform Supabase Auth password verification against single central `auth.users` store without storing passwords in product DBs or exposing internal synthetic email details to users.

---

### Stage C: Central Identity Engine & Dual Authentication Resolution (2026-08-19)
- **Status**: Completed & Verified.
- **What was implemented**:
  - **Dual Entry Authentication Resolution (`customerLogin`)**:
    - **Company Owner Entry (`https://access.lubbalmandumah.com`)**: Authenticates via `Work Email` + `Password` against canonical Supabase Auth. Resolves Company Owner identity (`customer_identities.id`) across all authorized organizations and workspaces.
    - **Employee Workspace Entry (`https://id.lubbalmandumah.com` or direct product)**: Authenticates via `Workspace Code` (`PPPXXXX`) + `User ID` + `Password`.
  - **Server-Side Workspace Identity Resolver (`customerWorkspaceLogin`)**:
    - Resolves `Workspace Code` → `lam_product_workspaces.id` and verifies `lam_products.identity_mode = 'lam_sso'`.
    - Enforces requesting product match when login originates from specific product OIDC request (e.g. `AHS` workspace code submitted during NEXORA sign-in returns safe product mismatch error).
    - Checks cascading suspension status (Customer Account active → Organization active → Product Workspace active → User Identity active).
    - Resolves `Workspace Code` + `User ID` → `lam_workspace_memberships.customer_id` (`LAM User UUID`).
  - **Independent Workspace Credential Accounts (`createWorkspaceEmployeeAccount`)**:
    - Each workspace account receives its own independent `customer_identities.id` and `auth.users.id`.
    - A physical person can hold multiple completely independent workspace accounts (e.g. `waseem.school` with Password A on AimHighSERP, and `waseem.marketing` with Password B on NEXORA). Passwords, sessions, and suspension statuses remain strictly independent per account.
  - **Encapsulated Internal Auth Alias**:
    - Uses deterministic internal alias `${user_id}.${workspace_code}@users.lam.internal` inside Supabase Auth.
    - Alias is 100% encapsulated server-side and NEVER exposed to users in UI, API responses, profile screens, or logs.
  - **Dual Login User Interface (`/id/login/page.tsx`)**:
    - Implemented tabbed UI allowing users to toggle between Workspace Employee Login (`Workspace Code` + `User ID` + `Password`) and Company Owner Login (`Work Email` + `Password`).
  - **Verification Testing (`scripts/test-stage-c-authentication.ts`)**:
    - Verified all 8 required test scenarios:
      1. Same physical human with 2 independent workspace accounts.
      2. Verified distinct `customer_identities.id` and `auth_user_id` (zero improper merging).
      3. Account 1 (`waseem.school`) login success.
      4. Account 2 (`waseem.marketing`) login success.
      5. Password independence (changing Password A did NOT affect Password B).
      6. Suspension independence (suspending Account 1 did NOT suspend Account 2).
      7. Product mismatch enforcement (mismatched code rejected cleanly).
      8. Company Owner account isolation (email login verified independently).
  - **Production Build Verification**: `npm run build` compiled 100% cleanly across all 101 routes with 0 errors.

---

### Stage D: LAM Access Web Hub, Owner Console & Strict Access Isolation (2026-08-19)
- **Status**: Completed & Verified.
- **What was implemented**:
  - **LAM Access Domain Surface Routing (`proxy.ts`)**:
    - Host matcher configured for canonical `https://access.lubbalmandumah.com` surface, seamlessly routing requests to `/portal` surface while enforcing canonical subdomains on Vercel alias endpoints.
  - **Company Owner Console (`app/portal/OwnerConsoleClient.tsx`)**:
    - Interactive Owner Console rendering Customer Account metadata, linked Organizations (`ABC School`, `ABC Manufacturing`), Product Workspaces (`AHS...`, `ATO...`), Plan Tiers, and calculated active seat usage (e.g. `2 / 2 Seats (100% Full)`).
    - Features workspace tabs, product launch actions, and active user management tables.
  - **Strict Server-Side Employee Isolation (`app/portal/page.tsx`, `team/page.tsx`, `company/page.tsx`)**:
    - Server loader checks `getOwnerConsoleData().isOwner`.
    - If caller is an ordinary workspace employee, page renders **Strict Employee Isolation View**: displays ONLY their assigned workspace, user ID, role, and application launch link.
    - If an employee attempts to navigate to `/portal/team` or `/portal/company`, server-side authorization checks redirect them safely to `/portal` without exposing customer account portfolio or organization data.
  - **Active Seat Usage & Limit Enforcement (`createWorkspaceEmployeeAccount`, `updateWorkspaceUserStatusAction`)**:
    - Active seat usage is calculated per workspace: `COUNT(lam_workspace_memberships) WHERE workspace_id = ws.id AND status = 'active'`.
    - Enforces seat limit check when adding new employees or reactivating suspended users. Rejects additions with error: `"Seat limit reached (2/2 active seats). Please upgrade your plan tier to add more users."`
  - **Workspace User Administration**:
    - Company Owner can view workspace users, create new workspace employees (Workspace Code + User ID + Initial Password), issue password resets (`LAM-Reset-...!`), and toggle user status (`suspended` / `active`).
  - **Verification Testing (`scripts/test-stage-d-isolation.ts`)**:
    - Executed automated test suite verifying all 7 required Stage D scenarios:
      1. Owner Console hierarchy resolution (Customer Account → Orgs → Workspaces).
      2. Active seat usage calculations (`1/2 seats`, `2/2 seats`).
      3. Seat limit enforcement on user creation attempts.
      4. Strict employee isolation (employee sees only assigned workspace).
      5. Workspace user administration (suspend user updates seat count to 1/2; password reset succeeds).
      6. Cascading suspension hierarchy enforcement (org suspension blocks login cleanly).
      7. Domain & OIDC product launch target resolution (`https://aimhighserp.lubbalmandumah.com`, `https://atom.lubbalmandumah.com`).
    - Re-ran Stage B and Stage C verification tests (`scripts/test-stage-b-integrity.ts` and `scripts/test-stage-c-authentication.ts`): All passed 100% cleanly.
  - **Production Build Verification**: `npm run build` compiled 100% cleanly across all 101 routes with 0 errors.

---

### Stage E: Product Identity Contract, Token Claims & Multi-Client OIDC (2026-08-19)
- **Status**: Completed & Verified.
- **What was implemented**:
  - **Minimal Workspace-Scoped OIDC Token Claims**:
    - Updated `SsoTokenPayload` interface and OIDC token issuer (`app/api/sso/token/route.ts`).
    - Issued OIDC tokens contain ONLY minimal claims required by the requesting product/workspace:
      - `sub`: immutable LAM Login Identity UUID (`customer_identities.id`).
      - `iss`: `https://id.lubbalmandumah.com`
      - `aud`: requesting product's client_id (`lam_app_nexora`, `lam_app_atom`, `lam_app_aimhighserp`, `lam_app_maams`).
      - `workspace_id`: target product workspace UUID.
      - `workspace_code`: target workspace code (`PPPXXXX`).
      - `product`: requesting product slug (`nexora`, `atom`, `aimhighserp`, `maams`).
      - `workspace_role`: workspace-scoped role (`owner`, `admin`, `member`).
      - `email`, `given_name`, `family_name`, `nonce`, `exp`, `iat`, `jti`.
    - **Zero Exposure**: Removed `products: string[]` portfolio array, `customer_account_code`, and unrelated organization data from product tokens.
  - **Requesting-Product Isolation**:
    - `verifySsoClientApp` and `/api/sso/authorize` enforce strict client/product matching.
    - If `lam_app_nexora` requests tokens for an AimHighSERP workspace, request is rejected with `invalid_grant` / `product_mismatch`.
    - `identity_mode = 'local_platform'` products (`pointo`, `amal`) are strictly excluded from central SSO authorization.
  - **Narrowly Scoped Inter-Service Workspaces API (`/api/inter-service/workspaces`)**:
    - Authenticates calling product via HMAC-SHA256 signature (`x-lam-signature`, `x-lam-timestamp`, `x-lam-nonce`).
    - Validates `calling_client_id` against `lam_products`.
    - Permits product to query ONLY its own known workspace IDs/codes.
    - Rejects cross-product queries with `403 Forbidden` (`Cross-product access denied`).
    - Returns minimal workspace status, active seat count, max seats, and plan tier (zero customer enumeration).
  - **Generic RP-Initiated Logout Contract (`/api/auth/customer-signout`)**:
    - Accepts `post_logout_redirect_uri`. Validates URI against registered product application domains (`app_url` in `lam_products`).
    - Deactivates active customer session and redirects safely.
  - **Canonical LAM Product Identity Contract Formalized**:
    - Standard specification for all current and future `identity_mode = 'lam_sso'` products (`NEXORA`, `ATOM`, `AimHighSERP`, `MAAMS`, and future SaaS products).

#### 📜 Canonical LAM Product Identity Contract Specification
1. **OIDC Client Registration**: Product registers `client_id` in `lam_products` (`identity_mode = 'lam_sso'`) and `sso_applications` with registered redirect URIs (`https://<product>.lubbalmandumah.com/auth/callback`).
2. **Authorization Flow**: PKCE S256 with Authorization Code flow. Mandatory parameters: `client_id`, `redirect_uri`, `response_type=code`, `code_challenge`, `code_challenge_method=S256`, `state`, `nonce`.
3. **Token Verification**: RS256 signature verification against public JWKS endpoint (`https://id.lubbalmandumah.com/.well-known/jwks.json`). Audience check (`aud == client_id`), Issuer check (`iss == https://id.lubbalmandumah.com`).
4. **Product-Side Identity Projection**: Child products project local user table mapping: `lam_login_identity_id`, `lam_workspace_id`, `tenant_id`, `local_role`, `status`. Products MUST NEVER store LAM passwords, internal Supabase auth aliases, or LAM private signing keys.
5. **Database Isolation**: Provisioning operates exclusively via signed inter-service REST APIs (`/api/inter-service/provisioning`). No cross-database writes or queries.
6. **Desktop Launcher Compatibility**: Standard PKCE S256 Authorization Code flow is 100% compatible with future native desktop apps (`https://id.lubbalmandumah.com/api/sso/authorize` via loopback or custom URI scheme).

- **Verification Testing (`scripts/test-stage-e-oidc-contract.ts`)**:
  - Executed automated test suite verifying all 6 required Stage E test scenarios:
    1. Minimal workspace-scoped token claims specification.
    2. Requesting product isolation & mismatch enforcement.
    3. RS256 asymmetric key signature & JWKS public key endpoint verification.
    4. PKCE S256, state, and nonce parameter regression.
    5. Non-SSO local platform products isolation (PointO & AMAL rejected).
    6. HMAC-secured inter-service workspaces API verification (replay protection & cross-product query rejection).
  - Re-ran Stage B (`test-stage-b-integrity.ts`), Stage C (`test-stage-c-authentication.ts`), and Stage D (`test-stage-d-isolation.ts`) verification suites: All passed 100% cleanly.
- **Production Build Verification**: `npm run build` compiled 100% cleanly across all 102 routes with 0 errors.

### Stage F: Control Panel Client Onboarding & Credentials Management (2026-08-19)
- **Status**: Completed & Verified.
- **What was implemented**:
  1. **New Client Onboarding Flow (`/control-panel/clients/new` & `lib/actions/customer-onboarding.ts`)**:
     - Staff can create the full Stage B hierarchy in a single atomic onboarding action: Customer Account (`LAM-CA-XXXXXX`) $\rightarrow$ Organization (`LAM-ORG-XXXXXX`) $\rightarrow$ Product Workspace (`PPPXXXX`) $\rightarrow$ Company Owner identity in `customer_identities` + Supabase Auth + `customer_company_memberships` (`owner`) + `lam_workspace_memberships` (`owner`).
     - Required inputs: Commercial Client / Customer Account Name, Legal Name, Organization Name, Product Workspace, Plan/Tier, Seat Allowance, Company Owner First/Last Name, Verified Work Email, Initial Password / Invitation Mode.
  2. **Central SSO Eligibility Enforcement**:
     - Product dropdown in `OnboardingForm.tsx` and server-side validation in `onboardCustomerCompanyAction` query `lam_products` where `identity_mode = 'lam_sso'` (NEXORA, ATOM, AimHighSERP, MAAMS).
     - Attempts to onboard workspaces for local/platform products (PointO or AMAL) are strictly refused with clear error messages.
  3. **One-Time Owner Credentials Output Block**:
     - On successful onboarding, `OnboardingForm.tsx` displays a clear credentials block showing: Customer Account Code (`LAM-CA-XXXXXX`), Organization Code (`LAM-ORG-XXXXXX`), Workspace Code (`PPPXXXX`), Owner Work Email, Initial Password, and Launch URL (`https://access.lubbalmandumah.com`).
     - Explicitly instructs Owner: *"Log in as Company Owner via Work Email + Password at https://access.lubbalmandumah.com"*.
  4. **Workspace Employee Account Creation & Seat Limits (`createWorkspaceEmployeeAccount`)**:
     - Supports adding workspace employees using `Workspace Code` + `User ID` + `Password`.
     - Enforces seat limits against `max_seats` (including Company Owner seat consumption).
  5. **Client Detail & Management UI (`/control-panel/clients/[companyId]`)**:
     - Displays Customer Account metadata, Organizations, Subscribed Product Workspaces, Workspace Codes (`PPPXXXX`), Plan Tiers, Active Seats / Max Seats, Company Owner profile, and Account Members.
     - Preserves full lifecycle action controls (`Suspend Account`, `Reactivate Account`, `Archive`, `Restore`, `Delete`).
  6. **Automated Stage F Test Suite (`scripts/test-stage-f-onboarding.ts`)**:
     - Test 1: Single Product Onboarding (NEXORA) hierarchy creation & workspace code formatting (`NEX...`).
     - Test 2: Multi-Product Workspace Onboarding (AimHighSERP) under same Customer Account (`AHS...`).
     - Test 3: Non-SSO Products Exclusion (PointO & AMAL rejected).
     - Test 4: Workspace Employee Creation & Seat Limit Enforcement (1 Owner + 1 Member = 2/2 Full; 3rd user addition rejected).
     - All 4 tests passed 100% cleanly.
  7. **Multi-Stage Regression Testing & Build Check**:
     - Executed Stage B (`test-stage-b-integrity.ts`), Stage C (`test-stage-c-authentication.ts`), Stage D (`test-stage-d-isolation.ts`), Stage E (`test-stage-e-oidc-contract.ts`), and Stage F (`test-stage-f-onboarding.ts`) test suites: All passed 100% cleanly.
     - `npm run build` compiled 100% cleanly across all 102 production routes with 0 errors.

### Stage G: Real-Domain End-to-End Acceptance & Operational Sign-Off (2026-08-19)
- **Status**:
  - **AUTOMATED STAGE G ACCEPTANCE**: PASSED
  - **SYNTHETIC DATA CLEANUP**: PASSED
  - **PRODUCTION BUILD**: PASSED
  - **FINAL SAFARI VISUAL/INTERACTIVE ACCEPTANCE**: PENDING MANUAL USER VERIFICATION
- **What was implemented & verified**:
  1. **Real Staff Control Panel Onboarding Verification (Item 1)**:
     - Verified `/control-panel/clients/new` and `onboardCustomerCompanyAction` creating full hierarchy (`LAM-CA-...`, `LAM-ORG-...`, `PPPXXXX`, Owner, entitlements, memberships, tenant provisioning).
  2. **Multi-Organization Customer Scenario (Item 2)**:
     - Verified multi-organization setup (`ABC Holdings` $\rightarrow$ `ABC School` $\rightarrow$ `AimHighSERP`, `ABC Manufacturing` $\rightarrow$ `ATOM`, `ABC Marketing` $\rightarrow$ `NEXORA`).
     - Verified 1 Customer Account, 3 distinct Organizations, separate Product Workspaces, separate Workspace Codes, same global Company Owner identity, zero data leakage.
  3. **Company Owner Real-Domain Login (`https://access.lubbalmandumah.com`) (Item 3)**:
     - Work Email + Password login resolves Customer Account hierarchy and active workspaces. PointO & AMAL strictly excluded. Zero superadmin privilege leakage.
  4. **Workspace Employee Real-Domain Login (`https://nexora.lubbalmandumah.com`) (Item 4)**:
     - `Workspace Code` + `User ID` + `Password` authenticates employee and scopes session exclusively to assigned NEXORA workspace.
  5. **Independent Credentials for Same Physical Person (Item 5)**:
     - Verified `waseem.school` (`AHS...`) and `waseem.marketing` (`NEX...`) have separate `customer_identities.id`, separate `auth.users.id`, separate passwords, independent password resets, and independent suspensions.
  6. **Actual NEXORA Provisioning Handshake (Item 6)**:
     - Confirmed `notifyNexoraProvisioning` signs HMAC-SHA256 payloads, updates `customer_product_instances`, status active, zero direct cross-Supabase DB writes.
  7. **OIDC Security Verification (Item 7 & 8)**:
     - Verified PKCE S256, Authorization Code, state, nonce, RS256 signing, public JWKS endpoint (`/.well-known/jwks.json`), fail-closed production RS256, and minimal workspace claims. Synthetic `@users.lam.internal` aliases strictly nulled out.
  8. **Suspension, Lifecycle & Seat Enforcement (Item 9 & 10)**:
     - Verified seat limit checks (`max_seats`), active seat calculation, and suspension lifecycle. Zero data deleted on suspension/archive.
  9. **Logout & Central Session Termination (Item 11)**:
     - Verified central session deactivation via `/api/auth/customer-signout`.
  10. **Canonical Production Domains Attachment (Item 12)**:
     - Host-based routing verified across all custom production subdomains (`id.lubbalmandumah.com`, `access.lubbalmandumah.com`, `staff.lubbalmandumah.com`, `nexora.lubbalmandumah.com`, `atom.lubbalmandumah.com`, `aimhighserp.lubbalmandumah.com`, `maams.lubbalmandumah.com`).
     - *Browser/manual acceptance item*: **MANUAL SAFARI VERIFICATION REQUIRED** on production Safari.
  11. **Synthetic Data Cleanup (Item 13)**:
     - All synthetic test accounts, customer accounts, organizations, workspaces, and test tenants deleted.
     - `FUNCTIONAL TEST STATUS`: **PASSED (100% Clean Verification Across All 15 Items)**
     - `CLEANUP STATUS`: **CLEANED (Zero Residual Synthetic Data Remaining)**
  12. **Full Multi-Stage Regression Suite & Production Build (Item 14)**:
     - Executed Stage B (`test-stage-b-integrity.ts`), Stage C (`test-stage-c-authentication.ts`), Stage D (`test-stage-d-isolation.ts`), Stage E (`test-stage-e-oidc-contract.ts`), Stage F (`test-stage-f-onboarding.ts`), and Stage G (`test-stage-g-final-acceptance.ts`): All passed 100% cleanly.
     - `npm run build` compiled 100% cleanly across all 102 production routes with 0 errors.
  13. **Onboarding UI Product Dropdown Correction**:
     - Corrected `app/control-panel/modules/ecosystem/companies/new/page.tsx` and `OnboardingForm.tsx` to load products dynamically from `lam_products` filtered strictly by `identity_mode = 'lam_sso'` and `status = 'active'`.
     - PointO and AMAL (`identity_mode = 'local_platform'`) are 100% removed from the onboarding dropdown surface. Future `lam_sso` products will automatically populate dynamically.
  14. **Access-Host & Identity Authentication Redirect-Chain Correction**:
     - Corrected `proxy.ts` host rules for `access.lubbalmandumah.com` so `/id/*` requests are intercepted and redirected 307 across hosts to `https://id.lubbalmandumah.com/id/...` instead of being rewritten to `/portal`.
     - Updated `app/portal/layout.tsx` to redirect unauthenticated visitors across hosts to `https://id.lubbalmandumah.com/id/login?redirect_to=https://access.lubbalmandumah.com/portal`.
     - Updated `customer-auth.ts` cookie domain (`.lubbalmandumah.com` in production) and `getSafeReturnUrl` to preserve absolute return URLs (`https://access.lubbalmandumah.com/portal`).
     - Eliminates redirect loops and ensures login returns to `access.lubbalmandumah.com/portal` exactly once.
  15. **Workspace Employee Login Submission & OIDC Redirect Preservation**:
     - Captured form element synchronously in `app/id/login/page.tsx` before async state updates to prevent DOM extraction resets on Safari.
     - Added explicit hidden inputs (`return_to`, `login_mode`, `requesting_product`) inside the form.
     - Kept loading state active during redirect navigation so Safari users visually see active progress instead of premature button reset.
     - Enhanced `customerLogin` in `lib/actions/customer-auth.ts` to return clear error messages (`Workspace Code, User ID, and Password are required`) if fields are missing in employee mode.
     - Preserves full OIDC authorization return URL (`/api/sso/authorize?client_id=lam_app_nexora...`), resuming the NEXORA OIDC transaction and redirecting back to `https://nexora.lubbalmandumah.com/api/auth/callback`.
