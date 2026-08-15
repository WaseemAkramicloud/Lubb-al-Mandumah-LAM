# LAM Web Control Panel - Master Log

> **AI ORIENTATION INSTRUCTION:**
> Before making any change, read this `LAM_WEB_CONTROL_PANEL_MASTER_LOG.md` and inspect the current code relevant to the requested change. Treat this master log as orientation, not as a substitute for verifying the actual code/database state. Make only the requested change, preserve established LAM Web Control Panel architecture and permission boundaries, run relevant checks, then update the CURRENT STATUS and append a dated maintenance entry to this same `LAM_WEB_CONTROL_PANEL_MASTER_LOG.md`. Do not create another progress/status Markdown file.

## 🎯 CURRENT STATUS
- **Phase 1 (Foundation to Security Review)** is **Completed** (Stages 1–9).
- **Phase 2 (CMS Expansion & Global Configuration)** is **Completed** (Stages 1–6).
- **Phase 3 (Future-Proofing Products & CRM Foundations)** is **Completed** (2026-08-11).
- **Phase 4 (LAM ID, Central Identity, Customer Access & SSO Foundation — Hardened)** is **Completed & Fully Verified** (2026-08-11).
- **Phase 5 (Deployed Access Correction, Invite-Only Customer Registration, Staff-Controlled Customer & Demo Onboarding)** is **Completed & Verified** (2026-08-11).
- **Phase 6 (Production Custom Domain Migration to LubbAlMandumah.com, Host Routing & OIDC Issuer Alignment)** is **Completed & Live Verified** (2026-08-15).
  - All 6 custom subdomains active and responding over HTTPS: `www.lubbalmandumah.com`, `lubbalmandumah.com` (redirects to www), `staff.lubbalmandumah.com`, `id.lubbalmandumah.com`, `account.lubbalmandumah.com`, and `nexora.lubbalmandumah.com`.
  - Next.js 16 host routing configured in `proxy.ts` separating public website, staff login/control panel, LAM ID OIDC authority, and customer account portal.
  - Canonical OIDC issuer aligned to `https://id.lubbalmandumah.com`.
  - Registered canonical NEXORA production callback `https://nexora.lubbalmandumah.com/api/auth/callback` in `sso_applications` Supabase table.
  - Both LAM and NEXORA production builds and test suites passed cleanly (LAM: 12/12 security tests passed; NEXORA: 20/20 SSO tests passed).



### Handover Checklist
Before pushing to production, the project owner MUST manually perform these actions:
1. **Run Database Migrations**: Execute `supabase/migrations/*` scripts (00 through 06) inside the Supabase SQL editor in sequential order to build the new control panel schemas.
2. **Environment Variables**: Ensure the production Vercel (or hosting) environment has the following set accurately:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (CRITICAL: Never expose this to browser bundles)
3. **Admin Recovery**: If all admins are locked out, you can run the `scripts/create-admin.ts` via terminal to forcibly inject a new Superadmin.
4. **Out of Scope (For Future Modules)**:
   - *LAM ID / SSO*: Not built (Authentication relies purely on standard email/password).
   - *LAM Central SaaS / Billing Engine*: Not built (The internal CRM and Pricing structure intentionally avoids processing actual stripe/paddle transactions).

---

## 📅 Stage Entries

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

## 📅 Phase 2: CMS Expansion & Global Configuration

### Stage 1: Full Website Content Audit & CMS Blueprint (2026-08-10)
- **Status**: Completed
- **Changes**:
  - Performed a comprehensive technical and content audit of every public route (`/`, `/about`, `/partners`, `/contact`, `/products`, etc.).
  - Documented the internal content inventory, mapping Page → Section → Component → Content → CMS Schema.
  - Identified master/reusable entities (`cms_products`, `cms_insights`, `cms_collections`) and validated their existing implementations.
  - Established a plan for Global Website Content (Header, Footer, Global SEO).
  - Identified the gap between the current generic Site Management UI and the actual rich structure required by the public components.
- **Deliverable**: Created `implementation_plan.md` which serves as the definitive CMS blueprint for subsequent stages. No destructive code changes made.
- **Manual actions required from me**: Review the `implementation_plan.md` (CMS Blueprint) and approve it to proceed.
### Stage 2: CMS Data Model & Content Migration (2026-08-10)
- **Status**: Completed
- **Changes**:
  - Maintained the clean structure of the existing `cms_sections` table (`content_schema`, `draft_content`, `published_content`).
  - Created and ran `seed_actual_content.js` to migrate the **exact** hardcoded UI text, titles, subtitles, and list elements into the `published_content` field.
  - Avoided any blank values or generic placeholders during migration.
  - Refactored the frontend React components (`app/about/page.tsx`, `app/partners/page.tsx`, `app/contact/page.tsx`, `app/about/careers/page.tsx` and all index pages) to use `getCmsPage(slug)`.
  - Passed TypeScript type checking and Next.js build validation (`npm run build`).

### Stage 3: Rebuild Site Management Page & Page/Section Navigation (2026-08-10)
- **Status**: Completed
- **Changes**:
  - Replaced the generic `cms_pages` loop in `Site Management` with a curated mapping that guarantees exactly the 10 core public pages (Home, Products, Solutions, Industries, Partners, About, Careers, Insights, Contact, Request Demo) and 1 Global Website Content placeholder.
  - Completely removed technical routing paths (e.g. `/[slug]`) from the UI to ensure non-technical staff see human-readable concepts.
  - Enhanced the Site Management landing page UI to leverage the LAM dark/gold premium identity.
  - Rebuilt the section cards in `[slug]/page.tsx` to automatically parse `draft_content` or `published_content` and extract meaningful text previews (e.g., pulling from `title`, `eyebrow`, `description` or summarizing array lengths).
  - Maintained the "Published" vs "Unpublished Draft" badges, correctly omitting "Not Set" when data is present.
  - Excluded drag-and-drop functionality since the actual frontend structure relies on fixed sequential components.
  - Executed a final `npm run build` to confirm absolute stability of the Next.js routes.

### Stage 4: Component-Specific Editors + Media Library Integration (2026-08-10)
- **Status**: Completed
- **Changes**:
  - Built a new `MediaPicker` UI component and a `getMediaAssets` server action to integrate the existing Media Library directly into the CMS editor.
  - Replaced the generic `image_url` text inputs with the visual `MediaPicker`, allowing users to select existing images or upload new ones without typing URLs.
  - Refactored `CmsEditForm.tsx` to safely obscure internal field keys (`field.name`) while displaying clean, human-readable labels and descriptions to the user.
  - Greatly improved the UX of repeatable content arrays: visually isolated each card, added "Move Up / Move Down" buttons for easy reordering, and integrated precise add/remove controls.
  - Fixed UX issues like `textarea` heights and protected the form from duplicate layout bugs.
  - Re-ran `npm run build` and resolved all strict TypeScript typings inside the new dynamic editor.

### Stage 5: Master Content Modules & Website References (2026-08-10)
- **Status**: Completed
- **Changes**:
  - Confirmed the **Products Module** fully handles all detail JSON requirements (`whatItIs`, `capabilities`, `problemsSolved`, `benefits`, etc.) using the dynamic forms.
  - Created new **Solutions** and **Industries** modules under `/control-panel/modules/` that share a unified `CollectionForm` connected directly to the `cms_collections` table.
  - Updated the **Control Panel SidebarNav** to grant navigation access to the new modules, appropriately bound by `site_management` permissions.
  - Rebuilt the Homepage's **Featured Products** component (`ProductsStrip.tsx`) to accept data dynamically from `home_products` CMS section rather than duplicating product data. It accepts an array of product slugs and uses `getProductById` to render the correct cards securely.
  - Ran `supabase/migrations/20260810000007_stage9.sql` to gracefully inject the new `home_products` section into the CMS without disrupting existing records.
  - Re-ran `npm run build` and verified that static and dynamic page generation executes securely (fallback behaviors correctly prevented any build crashes despite new database schema).
- **Next Step**: Stage 6 (Awaiting User Instruction).

### Stage 6: Editorial Workflow, Security & Production Validation (2026-08-10)
- **Status**: Completed
- **Changes**:
  - Implemented comprehensive server-side Draft and Publish routines for the remaining Master Content Modules (Products, Insights, Solutions, Industries).
  - Modified data fetchers across the public dynamic routes (`app/products/[slug]`, `app/insights/[slug]`, etc.) to parse `?preview=true` via URL params.
  - Connected `previewUrl` dynamically into the generic `CmsEditForm`, `ProductForm`, `InsightForm`, and `CollectionForm`.
  - Enforced server-side permission checks across all "Publish to Live Site" actions, preventing unauthorized users from modifying public data.
  - Intercepted form submissions natively in Server Actions (`lib/actions/collections.ts`, `lib/actions/products.ts`, etc.) to intercept the `publish` intent and run the centralized `logAudit` function.
  - Populated the `audit_logs` tracking table with the `draft_saved` and `published` action data.
  - Verified static generation parameters to guarantee `DYNAMIC_SERVER_USAGE` errors generated by conditional `cookies()` reading gracefully fall back to dynamic generation, rather than breaking builds.
- **Checks**: Full end-to-end `npm run build` executed successfully with zero type errors and robust fallbacks.
- **Next Step**: Awaiting Instruction 2 of 5 from user.

### Phase 4, Instruction 1 of 5: LAM ID, Customer Identity & SSO Foundation (2026-08-11)
1. **Current stage and status**: Completed.
2. **What was implemented**:
   - **Database Migration (`20260811000001_lam_id_sso.sql`)**: Additive SQL migration creating 10 new central identity and SSO tables (`customer_identities`, `customer_company_memberships`, `customer_product_entitlements`, `customer_product_access`, `customer_product_instances`, `customer_identity_mappings`, `sso_applications`, `sso_auth_codes`, `customer_invitations`, `customer_sessions`, `customer_audit_logs`). Seeded client registry for default SaaS products (`lam_app_nexora`, `lam_app_atom`, `lam_app_pointo`).
   - **OAuth 2.0 / OIDC Authorization Engine**:
     - `lib/sso/jwt.ts`: Standard HMAC-SHA256 OIDC JWT token encoder/decoder and JWKS generator.
     - `lib/sso/sso-service.ts`: Multi-layered product access validator enforcing the core rule: (1) Active customer identity, (2) Active company membership, (3) Active company product entitlement, AND (4) Explicit user product access grant.
     - `/api/sso/authorize`: SSO authorization handler. Validates client, checks authentication & explicit product access, generates PKCE auth code, and redirects to client app.
     - `/api/sso/token`: Token exchange endpoint. Exchanges authorization codes for signed OIDC ID Tokens & Access Tokens. Single-use token guarantee.
     - `/api/sso/userinfo` & `/api/sso/validate`: OIDC UserInfo and direct API token validation endpoints.
     - `/.well-known/jwks.json`: Public JWKS key discovery endpoint.
   - **Customer Identity UI (`/id/*`)**:
     - `/id/login`: Central customer login screen with SSO authorization continuation support (`return_to`). Logically isolated from staff login (`/staff-login`).
     - `/id/register`: Customer account & company creation screen. Auto-generates `crm_companies` record, assigns owner role, and sets default demo entitlements.
     - `/id/forgot-password`: Password reset request flow.
     - `/id/invite/[token]`: Secure invitation token redemption handler.
   - **Customer Account Portal (`/portal/*`)**:
     - `/portal/layout.tsx`: Portal shell featuring sticky topbar, active company badge, user profile, and signout handler (`/api/auth/customer-signout`).
     - `/portal/page.tsx`: Customer dashboard with active company role, product launchpad, and single-click SSO launch buttons.
     - `/portal/products/page.tsx`: Subscriptions and entitlements directory.
     - `/portal/team/page.tsx` & `TeamAccessClient.tsx`: Interactive team directory allowing organization Owners/Admins to explicitly grant or revoke product access per user in real time.
3. **User-visible routes added**:
   - `/id/login`, `/id/register`, `/id/forgot-password`, `/id/invite/[token]`
   - `/portal`, `/portal/products`, `/portal/team`
   - `/api/sso/authorize`, `/api/sso/token`, `/api/sso/userinfo`, `/api/sso/validate`, `/.well-known/jwks.json`
4. **Important files created**:
   - `supabase/migrations/20260811000001_lam_id_sso.sql`
   - `lib/sso/jwt.ts`, `lib/sso/sso-service.ts`, `lib/actions/customer-auth.ts`
   - `app/api/sso/authorize/route.ts`, `app/api/sso/token/route.ts`, `app/api/sso/userinfo/route.ts`, `app/api/sso/validate/route.ts`, `app/.well-known/jwks.json/route.ts`
   - `app/id/login/page.tsx`, `app/id/register/page.tsx`, `app/id/forgot-password/page.tsx`, `app/id/invite/[token]/page.tsx`
   - `app/portal/layout.tsx`, `app/portal/page.tsx`, `app/portal/products/page.tsx`, `app/portal/team/page.tsx`, `app/portal/team/TeamAccessClient.tsx`
5. **Database changes**:
   - Created 10 central identity & SSO tables with service-role RLS policies and `updated_at` triggers.
6. **Authentication, roles and permissions**:
   - Customer authentication is logically separate from staff authentication (`@lamweb.com` / `staff_profiles`).
   - Explicit user product access grants (`customer_product_access`) enforced during SSO authorization.
   - All customer security events logged via `logCustomerAudit()`.
7. **Environment variables**: No new variables required.
8. **Tests/build checks performed**:
   - `npm run build`: Exit code 0 (27/27 static/dynamic routes compiled cleanly).
9. **Manual steps required from project owner**:
   - Run `supabase/migrations/20260811000001_lam_id_sso.sql` in the Supabase SQL Editor.
10. **Known issues & deferred items**: None.
11. **Exact recommended next step**: Await Instruction 2 of 5 from user.

### Phase 3: Future-Proofing Products & CRM Foundations (2026-08-11)
1. **Current stage and status**: Completed.
2. **What was implemented**:
   - **Migration Script (`20260811000000_future_proof_products_crm.sql`)**: Additive SQL migration extending `cms_products`, creating `crm_companies`, `crm_contacts`, `crm_company_products`, adding `product_slug` FK & `company_id` to `crm_leads`, adding `company_id` to `crm_clients`, backfilling existing data, and seeding `lam_ecosystem` system settings.
   - **Products Module**:
     - Extended `lib/actions/products.ts` to process internal admin fields, integration metadata, and Superadmin-only Product ID edits (`updateProductId`).
     - Updated `ProductForm.tsx` into three distinct visual cards: Public Product Content (unchanged), Internal Product Information (new), and Product Integration metadata (new).
     - Updated `app/control-panel/modules/products/page.tsx` with Product ID (gold monospace badge), Type, Lifecycle status badges, and website publishing status.
   - **Leads & Clients Module**:
     - Upgraded `lib/actions/crm.ts` with company deduplication on conversion, contact creation, product interest linking, and CRUD actions for companies, contacts, and company-product interests.
     - Updated `lib/actions/forms.ts` with `resolveProductSlug` to match free-text inquiry inputs to relational product slugs.
     - Updated `app/control-panel/modules/leads-clients/page.tsx` to display product names resolved from the relational `product_slug` FK, and added "Companies" nav button.
     - Updated `LeadDetailClient.tsx` and `[id]/page.tsx` with product slug resolution and optional linking to existing companies during conversion.
     - Built new Companies registry (`/control-panel/modules/leads-clients/companies/page.tsx`) and Company profile page (`[id]/page.tsx`).
     - Updated Clients listing (`clients/page.tsx`) and detail screen (`ClientDetailClient.tsx`) to display linked Company info and contacts.
   - **Dashboard**:
     - Updated `Widgets.tsx` with `ProductPortfolioWidget` (2x2 status breakdown grid).
     - Updated `DashboardGrid.tsx` and `app/control-panel/dashboard/page.tsx` to query product counts by lifecycle status and include the widget in default/custom layouts.
   - **System Settings**:
     - Extended `lib/actions/system.ts` with `updateEcosystemSettings()`.
     - Added gold-bordered "LAM Ecosystem" card to `SystemSettingsForm.tsx` for platform architecture metadata.
3. **User-visible routes added/changed**:
   - `/control-panel/modules/products` (Added Product ID & Lifecycle columns)
   - `/control-panel/modules/products/[slug]/edit` (Internal admin & integration fields added)
   - `/control-panel/modules/leads-clients` (Added Companies button, relational product names)
   - `/control-panel/modules/leads-clients/companies` (NEW: Company registry)
   - `/control-panel/modules/leads-clients/companies/[id]` (NEW: Company profile detail)
   - `/control-panel/modules/leads-clients/clients` (Added Company link column)
   - `/control-panel/modules/leads-clients/clients/[id]` (Added Company & contacts cards)
   - `/control-panel/dashboard` (Added Product Portfolio widget)
   - `/control-panel/modules/system-settings` (Added LAM Ecosystem section)
4. **Important files created/modified**:
   - `supabase/migrations/20260811000000_future_proof_products_crm.sql` [NEW]
   - `lib/actions/products.ts` [MODIFY]
   - `lib/actions/crm.ts` [MODIFY]
   - `lib/actions/forms.ts` [MODIFY]
   - `lib/actions/system.ts` [MODIFY]
   - `app/control-panel/modules/products/ProductForm.tsx` [MODIFY]
   - `app/control-panel/modules/products/page.tsx` [MODIFY]
   - `app/control-panel/modules/products/[slug]/edit/page.tsx` [MODIFY]
   - `app/control-panel/modules/leads-clients/page.tsx` [MODIFY]
   - `app/control-panel/modules/leads-clients/LeadDetailClient.tsx` [MODIFY]
   - `app/control-panel/modules/leads-clients/[id]/page.tsx` [MODIFY]
   - `app/control-panel/modules/leads-clients/companies/page.tsx` [NEW]
   - `app/control-panel/modules/leads-clients/companies/[id]/page.tsx` [NEW]
   - `app/control-panel/modules/leads-clients/clients/page.tsx` [MODIFY]
   - `app/control-panel/modules/leads-clients/clients/ClientDetailClient.tsx` [MODIFY]
   - `app/control-panel/modules/leads-clients/clients/[id]/page.tsx` [MODIFY]
   - `components/dashboard/Widgets.tsx` [MODIFY]
   - `app/control-panel/dashboard/DashboardGrid.tsx` [MODIFY]
   - `app/control-panel/dashboard/page.tsx` [MODIFY]
   - `app/control-panel/modules/system-settings/SystemSettingsForm.tsx` [MODIFY]
5. **Database changes**:
   - `cms_products`: Added `product_id`, `product_type`, `lifecycle_status`, `db_architecture`, `app_url`, `admin_url`, `product_owner`, `technical_owner`, `commercial_owner`, `internal_version`, `internal_notes`, `integration_status`, `api_base_url`, `health_check_url`, `webhook_url`, `external_product_ref`, `sso_status`, `last_sync_at`, `integration_notes`.
   - `crm_companies`: New table (`id`, `company_id`, `name`, `legal_name`, `country`, `city`, `website`, `email`, `phone`, `status`, `source`, `assigned_staff`, `notes`, `created_at`, `updated_at`).
   - `crm_contacts`: New table (`id`, `company_id`, `first_name`, `last_name`, `job_title`, `email`, `phone`, `preferred_contact`, `notes`, `created_at`, `updated_at`).
   - `crm_company_products`: New junction table (`id`, `company_id`, `product_slug`, `interest_type`, `created_at`).
   - `crm_leads`: Added `product_slug` FK and `company_id` FK.
   - `crm_clients`: Added `company_id` FK.
   - `system_settings`: Seeded `lam_ecosystem` key.
6. **Authentication, roles and permissions**:
   - Internal product fields are gated by `products` `edit` permission.
   - Product ID modifications require `super_admin` role.
   - All mutations logged via `logAudit()`.
   - Sensitive fields never exposed to public site or browser bundles.
7. **Environment variables**: No new variables required.
8. **Tests/build checks performed**:
   - `npm run build`: Exit code 0 (All routes compiled statically/dynamically without errors).
   - `npm run lint`: Exit code 0 (Zero warnings/errors).
9. **Manual steps required from project owner**:
   - Run `supabase/migrations/20260811000000_future_proof_products_crm.sql` in the Supabase SQL Editor.
10. **Known issues & deferred items**: None.
11. **Exact recommended next step**: Execute migration in Supabase SQL editor and test the Control Panel screens.

### Phase 4: LAM ID, Central Identity, Customer Access & SSO Foundation (2026-08-11)
1. **Current stage and status**: Completed & Verified.
2. **What was implemented**:
   - **LAM ID Boundary & Schema**: Implemented `customer_identities`, `customer_company_memberships`, `customer_product_entitlements`, `customer_product_access`, `customer_product_instances`, `customer_identity_mappings`, `sso_applications`, `sso_auth_codes`, `customer_sessions`, `customer_invitations`, `customer_audit_logs`, `inter_service_nonces`, and `nexora_platform_admins`.
   - **Standards-based OAuth 2.0 / OIDC SSO Service**:
     - Standard OIDC Discovery (`/.well-known/openid-configuration`) and JWKS key discovery (`/.well-known/jwks.json`).
     - PKCE authorization code issuance (`/api/sso/authorize`), single-use token exchange (`/api/sso/token`), token validation (`/api/sso/validate`), and UserInfo (`/api/sso/userinfo`).
     - Dedicated `LAM_SSO_JWT_SECRET` signing key isolation (never exposing service role keys).
     - Explicit access check: Customer Active + Company Active + Company Entitlement Active + Explicit User Product Access Grant.
   - **Inter-Service API Contracts for NEXORA Integration**:
     - `/api/inter-service/provisioning`: Inter-service endpoint for `activate`, `suspend`, `update_entitlement`, and tenant instance registration.
     - `/api/inter-service/invitations`: Processes `pending_lam_grant` queued invitations from NEXORA.
     - `/api/inter-service/platform-admins`: Grant/check NEXORA platform administrator privileges for trusted LAM identities.
     - Inter-service HMAC SHA-256 request signatures, timestamp freshness checks (±300s window), and nonce replay protection (`inter_service_nonces`).
   - **Customer Identity UI & Account Portal**:
     - Customer Auth (`/id/login`, `/id/register`, `/id/forgot-password`, `/id/reset-password`, `/id/invite/[token]`). Direct login support without public site detour.
     - Customer Account Management Portal (`/portal`, `/portal/company`, `/portal/products`, `/portal/team`, `/portal/security`, `/portal/profile`). Single-click direct product launch buttons.
   - **Ecosystem Administration in Internal Staff Control Panel**:
     - `/control-panel/modules/ecosystem`: Sub-modules for Customer Accounts (`companies`), Product Entitlements (`entitlements`), Product Instances (`instances`), Customer Identities (`identities`), and SSO Applications (`sso`).
   - **Secure Superadmin CLI Bootstrap**:
     - `scripts/bootstrap-superadmin.ts`: Accepts CLI arguments / env variables, checks for existing superadmins, creates/updates Supabase Auth user and `staff_profiles` with `super_admin` role. No hardcoded credentials or fictional users.
   - **Verification Test Suite**:
     - `scripts/test-lam-sso-foundation.ts`: Automated test suite verifying all 18 criteria (100% pass rate).
3. **User-visible routes added/changed**:
   - `/id/login`, `/id/register`, `/id/forgot-password`, `/id/reset-password`, `/id/invite/[token]`
   - `/portal`, `/portal/company`, `/portal/products`, `/portal/team`, `/portal/security`, `/portal/profile`
   - `/control-panel/modules/ecosystem` (landing dashboard)
   - `/control-panel/modules/ecosystem/companies` (Customer Accounts)
   - `/control-panel/modules/ecosystem/entitlements` (Product Entitlements)
   - `/control-panel/modules/ecosystem/instances` (Product Instances)
   - `/control-panel/modules/ecosystem/identities` (Customer Identities)
   - `/control-panel/modules/ecosystem/sso` (OAuth Applications Registry)
   - `/.well-known/openid-configuration`, `/.well-known/jwks.json`
   - `/api/sso/authorize`, `/api/sso/token`, `/api/sso/userinfo`, `/api/sso/validate`
   - `/api/inter-service/provisioning`, `/api/inter-service/invitations`, `/api/inter-service/platform-admins`
4. **Important files created/modified**:
   - `supabase/migrations/20260811000001_lam_id_sso.sql`
   - `supabase/migrations/20260811000002_lam_sso_inter_service.sql`
   - `lib/sso/jwt.ts`
   - `lib/sso/sso-service.ts`
   - `lib/sso/inter-service.ts`
   - `app/.well-known/openid-configuration/route.ts`
   - `app/api/inter-service/provisioning/route.ts`
   - `app/api/inter-service/invitations/route.ts`
   - `app/api/inter-service/platform-admins/route.ts`
   - `scripts/bootstrap-superadmin.ts`
   - `scripts/test-lam-sso-foundation.ts`
5. **Database changes**:
   - Added tables: `customer_identities`, `customer_company_memberships`, `customer_product_entitlements`, `customer_product_access`, `customer_product_instances`, `customer_identity_mappings`, `sso_applications`, `sso_auth_codes`, `customer_sessions`, `customer_invitations`, `customer_audit_logs`, `inter_service_nonces`, `nexora_platform_admins`.
6. **Authentication, roles and permissions**:
   - Explicit separation between internal staff (`staff_profiles` / `@lamweb.com`) and customer identities (`customer_identities`).
   - Generic company roles (`owner`, `admin`, `member`). Local NEXORA roles resolved inside NEXORA.
7. **Environment variables required**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `LAM_SSO_JWT_SECRET` (Optional, defaults to dedicated key in code)
   - `LAM_INTERSERVICE_SECRET` (Optional, defaults to dedicated key in code)
8. **Tests/build checks performed**:
   - `npx tsx scripts/test-lam-sso-foundation.ts`: 18/18 tests PASSED (100%).
   - `npm run build`: Exit code 0 (All 84 static/dynamic routes compiled cleanly).
9. **Manual steps required from project owner**:
   - Run `supabase/migrations/20260811000001_lam_id_sso.sql` and `20260811000002_lam_sso_inter_service.sql` in Supabase SQL editor.
   - Run `npx tsx scripts/bootstrap-superadmin.ts --email=... --password=...` to set up the first Superadmin.
10. **Known issues & deferred items**: None.
11. **Exact recommended next step**: Deploy database migrations and connect NEXORA SSO client using the integration report below.

### Phase 4 (Corrections & Hardening): RS256 Asymmetric Signing, Canonical Auth & Provisioning Direction (2026-08-11)
1. **Current stage and status**: Completed & Fully Verified.
2. **What was implemented**:
   - **RS256 Asymmetric Token Signing**: Replaced symmetric HMAC-SHA256 production signing with RS256 (RSA-2048) asymmetric signing in `lib/sso/jwt.ts`. Protected private RSA key is owned strictly by LAM ID (`LAM_SSO_PRIVATE_KEY` / auto-generated fallback).
   - **Public-Only JWKS**: Updated `/.well-known/jwks.json` to expose ONLY public RSA key material (`kty: "RSA"`, `alg: "RS256"`, `use: "sig"`, `kid: "lam-id-key-rs256-2026"`, `n`, `e`). Exposes zero private keys or symmetric secrets.
   - **Canonical Supabase Auth (`auth.users`)**: Removed `password_hash` / custom password hashing from `customer_identities`. Refactored `customerLogin`, `customerRegister`, `customerForgotPassword`, `customerResetPassword` in `lib/actions/customer-auth.ts` to use canonical Supabase Auth (`supabase.auth.signInWithPassword`, `supabase.auth.signUp`, `supabase.auth.admin.createUser`). Linked profiles directly via `auth_user_id`.
   - **NEXORA Redirect URI Alignment**: Seeded exact NEXORA callback path `https://nexora.lam.com/api/auth/callback` and local dev ports (`http://localhost:3000/api/auth/callback`, `http://localhost:3001/api/auth/callback`). Enforced exact URI matching (rejecting `/auth/callback`).
   - **Strict S256 PKCE**: Enforced `code_challenge_method = S256` in production mode (rejecting `plain` PKCE) in `/api/sso/authorize` and advertised in OIDC discovery (`/.well-known/openid-configuration`).
   - **Hardened Superadmin Bootstrap Locking**: Locked `scripts/bootstrap-superadmin.ts` permanently once a Superadmin exists. Removed `--force` flag. Created separate, auditable emergency script `scripts/emergency-superadmin-recovery.ts`.
   - **Production Issuer Domain**: Standardized issuer domain using `process.env.LAM_SSO_ISSUER` / `process.env.NEXT_PUBLIC_APP_URL` (`https://lam.com`).
   - **Outbound Inter-Service Provisioning Client**: Built `lib/sso/nexora-client.ts` to execute outbound HMAC-signed requests from LAM TO NEXORA (`https://nexora.lam.com/api/inter-service/provisioning`). Stored returned tenant references in `customer_product_instances`.
   - **Security Verification Suite**: Updated `scripts/test-lam-sso-foundation.ts` verifying all 12 hardened security criteria (100% PASS rate).
3. **User-visible routes added/changed**:
   - `/.well-known/openid-configuration` (RS256 & S256 advertised)
   - `/.well-known/jwks.json` (Public RSA keys only)
   - `/api/sso/authorize` (S256 PKCE enforced)
   - `/id/login`, `/id/register` (Using canonical Supabase Auth)
4. **Important files created/modified**:
   - `lib/sso/jwt.ts` [RS256 Asymmetric Signing & Verification]
   - `lib/sso/nexora-client.ts` [Outbound Provisioning Client]
   - `lib/actions/customer-auth.ts` [Canonical Supabase Auth Refactor]
   - `app/.well-known/openid-configuration/route.ts` [OIDC Metadata]
   - `app/api/sso/authorize/route.ts` [S256 PKCE Enforcement]
   - `scripts/bootstrap-superadmin.ts` [Permanent Lock Security Update]
   - `scripts/emergency-superadmin-recovery.ts` [Emergency Recovery Script]
   - `scripts/test-lam-sso-foundation.ts` [Security Verification Suite]
5. **Database changes**:
   - `sso_applications`: Updated seed redirect URIs to include exact `/api/auth/callback` path.
6. **Authentication, roles and permissions**:
   - Canonical Supabase Auth (`auth.users`) handles authentication for both staff and customers.
   - Separate application authorization contexts: `staff_profiles` vs `customer_identities`.
7. **Environment variables required**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `LAM_SSO_ISSUER` (Optional, defaults to `https://lam.com`)
   - `LAM_SSO_PRIVATE_KEY` / `LAM_SSO_PUBLIC_KEY` (Optional, auto-generated RSA-2048 key pair if omitted)
   - `LAM_INTERSERVICE_SECRET` (Optional, defaults to vault secret in code)
8. **Tests/build checks performed**:
   - `npx tsx scripts/test-lam-sso-foundation.ts`: 12/12 security tests PASSED (100%).
   - `npm run build`: Exit code 0 (All 84 static/dynamic routes compiled cleanly).
9. **Manual steps required from project owner**:
   - Execute database migrations `20260811000001_lam_id_sso.sql` and `20260811000002_lam_sso_inter_service.sql` in Supabase.
   - Run `npx tsx scripts/bootstrap-superadmin.ts --email=... --password=...` once on initial deployment.
10. **Known issues & deferred items**: None.
11. **Exact recommended next step**: Production deployment to Vercel and custom domain setup.

---

### Stage 11: Deployed Access Correction, Invite-Only Registration & Staff-Controlled Customer/Demo Onboarding (2026-08-11)
1. **Current stage and status**: Completed & Verified.
2. **What was implemented**:
   - **Superadmin Login Audit & Fix**: Audited Superadmin account `admin@lamweb.com`. Verified record exists in `auth.users` (`683b891a-ed71-439c-84f6-e022adbd53d8`), confirmed at `2026-08-09T03:04:27Z`, active status. Diagnosis: password hash mismatch in Supabase Auth. Fixed by resetting password in Supabase Auth (`updateUserById`). Verified live sign in returning 200 SUCCESS and valid session token. Existing identity, ID, profile, and permissions preserved without deletion. Password remains managed solely by Supabase Auth and can be changed in `/control-panel/profile`. No credentials hardcoded.
   - **Staff vs Customer Separation**: Kept `/staff-login` strictly for staff -> Control Panel and `/id/login` for customer identity (LAM ID).
   - **Invite-Only Public Registration**: Updated `/id/register` with invite-only guard. Anonymous visitors without an invitation token see a notice: *"Account Creation by Invitation Only. New LAM accounts are created by invitation. Please contact LAM or use the invitation sent to your email."* Invited token holders (`/id/invite/[token]` or `/id/register?token=...`) can complete registration.
   - **Staff-Controlled Customer & Demo Onboarding**: Built server action `onboardCustomerCompanyAction` in `lib/actions/customer-onboarding.ts` and Staff UI at `/control-panel/modules/ecosystem/companies/new`. Supports creating both Standard and Demo accounts (e.g. Unicore Enterprises demo preset button), configurable primary owner email, seat limits, optional demo expiry dates, credentials mode (Invite Link vs Temporary Initial Password), and triggers automated NEXORA provisioning (`notifyNexoraProvisioning`).
   - **Demo Lifecycle & Suspension Controls**: Updated Customer Accounts list (`/control-panel/modules/ecosystem/companies`) with `DEMO` / `STANDARD` badges, entitlement expiry dates, and inline **Suspend** / **Reactivate** server action buttons to toggle company & entitlement status without record deletion.
   - **Environment-Based URL Configuration**: Updated `sso_applications` redirect URIs in Supabase to include `https://nexora-nu-lime-63.vercel.app/api/auth/callback`. Updated `lib/sso/nexora-client.ts` to use `NEXT_PUBLIC_APP_URL` and `NEXORA_BASE_URL`.
3. **User-visible routes added/changed**:
   - `/id/register` (Invite-only notice & redemption)
   - `/control-panel/modules/ecosystem/companies` (Demo badges, expiry dates & Suspend/Reactivate actions)
   - `/control-panel/modules/ecosystem/companies/new` (Staff-controlled customer & demo onboarding form)
4. **Important files created/modified**:
   - `lib/actions/customer-onboarding.ts` [Onboarding & Status Toggle Server Actions]
   - `app/control-panel/modules/ecosystem/companies/new/page.tsx` [Onboarding Page]
   - `app/control-panel/modules/ecosystem/companies/new/OnboardingForm.tsx` [Interactive Onboarding Form Component]
   - `app/control-panel/modules/ecosystem/companies/page.tsx` [Customer List with Lifecycle Quick Actions]
   - `app/id/register/page.tsx` [Invite-Only Guard]
   - `lib/sso/nexora-client.ts` [Environment Provisioning URL Update]
   - `scripts/update-sso-redirects.ts` [SSO Application Redirect Updates]
   - `supabase/migrations/20260811000003_demo_company_lifecycle.sql` [Demo Support Schema]
5. **Database changes**:
   - Applied migration `20260811000003_demo_company_lifecycle.sql`: Added `company_type` column to `crm_companies` and `expires_at` column to `customer_product_entitlements`.
   - Updated `sso_applications`: Added `https://nexora-nu-lime-63.vercel.app/api/auth/callback` to allowed `redirect_uris`.
6. **Authentication, roles and permissions**:
   - Superadmin login preserved and password managed in Supabase Auth.
   - Staff user management remains isolated in Control Panel.
7. **Environment variables required**:
   - `NEXT_PUBLIC_APP_URL` (LAM Base URL: `https://lubb-al-mandumah-lam.vercel.app`)
   - `NEXORA_BASE_URL` (NEXORA Base URL: `https://nexora-nu-lime-63.vercel.app`)
   - `NEXORA_PROVISIONING_URL` (Optional, defaults to `${NEXORA_BASE_URL}/api/inter-service/provisioning`)
8. **Tests/build checks performed**:
   - Superadmin password auth test: PASSED (200 SUCCESS).
   - SSO redirect update test: PASSED.
   - `npm run build`: Exit code 0 (Compiled successfully across static and dynamic routes).
9. **Manual steps required from project owner**:
   - Set `NEXT_PUBLIC_APP_URL=https://lubb-al-mandumah-lam.vercel.app` and `NEXORA_BASE_URL=https://nexora-nu-lime-63.vercel.app` in Vercel environment settings for LAM project.
10. **Known issues & deferred items**: None.
11. **Exact recommended next step**: Deploy to Vercel and conduct live verification with project owner.

---

### Stage 12: Production Custom Domain Migration to LubbAlMandumah.com, Host Routing & OIDC Issuer Alignment (2026-08-15)
1. **Current stage and status**: Completed & Live Verified.
2. **What was implemented**:
   - **Host-Based Routing (`proxy.ts`)**: Integrated Next.js 16 host routing into `proxy.ts`. Enforces domain boundaries: `lubbalmandumah.com` ➔ 301 redirect to `www.lubbalmandumah.com`; `staff.lubbalmandumah.com` ➔ `/staff-login` & `/control-panel`; `id.lubbalmandumah.com` ➔ `/id/*`, `/api/sso/*`, `.well-known/*`; `account.lubbalmandumah.com` ➔ `/portal`. Preserved local development (`localhost:3000`) and Vercel previews.
   - **OIDC Issuer Alignment**: Updated default fallback issuer across LAM and NEXORA codebases to `https://id.lubbalmandumah.com`. Preserved RS256 RSA private key without regeneration.
   - **SSO Application Callback Registration**: Executed `update-sso-redirects.ts` script in LAM, registering `https://nexora.lubbalmandumah.com/api/auth/callback` in `sso_applications.redirect_uris` in Supabase.
   - **NEXORA Production Configuration**: Updated `.env`, `lib/auth/jwks.ts`, `app/api/auth/sso/route.ts`, and `app/api/auth/callback/route.ts` in NEXORA repository (`/Users/waseemakram/My Comp Data/My ERPs/Nexora`).
3. **User-visible routes added/changed**:
   - `https://www.lubbalmandumah.com` (Public LAM Website)
   - `https://lubbalmandumah.com` (Permanent 301 Redirect to www)
   - `https://staff.lubbalmandumah.com` (LAM Staff Login & Control Panel)
   - `https://id.lubbalmandumah.com` (LAM ID Authority, OIDC Discovery & JWKS)
   - `https://account.lubbalmandumah.com` (Customer Account Management Portal)
   - `https://nexora.lubbalmandumah.com` (Independent NEXORA SaaS Application)
4. **Important files created/modified**:
   - **LAM**: `proxy.ts`, `lib/sso/jwt.ts`, `lib/sso/nexora-client.ts`, `lib/actions/customer-onboarding.ts`, `app/.well-known/openid-configuration/route.ts`, `scripts/update-sso-redirects.ts`.
   - **NEXORA**: `.env`, `lib/auth/jwks.ts`, `app/api/auth/sso/route.ts`, `app/api/auth/callback/route.ts`.
5. **Database changes**:
   - Updated `sso_applications` in Supabase (`ykrjmctfmywhymgpkqlu`): Added `https://nexora.lubbalmandumah.com/api/auth/callback` to allowed `redirect_uris`.
6. **Authentication, roles and permissions**:
   - Staff authentication remains strictly isolated under `staff.lubbalmandumah.com`.
   - Customer authentication remains managed via LAM ID (`id.lubbalmandumah.com`) and Customer Account Portal (`account.lubbalmandumah.com`).
   - Self-registration remains blocked (invite-only token guard preserved).
7. **Environment variables required**:
   - **LAM Vercel**: `NEXT_PUBLIC_APP_URL=https://www.lubbalmandumah.com`, `LAM_SSO_ISSUER=https://id.lubbalmandumah.com`, `LAM_ID_BASE_URL=https://id.lubbalmandumah.com`, `LAM_ACCOUNT_BASE_URL=https://account.lubbalmandumah.com`, `LAM_STAFF_BASE_URL=https://staff.lubbalmandumah.com`, `NEXORA_BASE_URL=https://nexora.lubbalmandumah.com`.
   - **NEXORA Vercel**: `NEXT_PUBLIC_APP_URL=https://nexora.lubbalmandumah.com`, `NEXORA_BASE_URL=https://nexora.lubbalmandumah.com`, `NEXORA_CALLBACK_URL=https://nexora.lubbalmandumah.com/api/auth/callback`, `LAM_OIDC_ISSUER=https://id.lubbalmandumah.com`, `LAM_OIDC_AUTHORIZE_URL=https://id.lubbalmandumah.com/api/sso/authorize`, `LAM_OIDC_TOKEN_URL=https://id.lubbalmandumah.com/api/sso/token`, `LAM_OIDC_JWKS_URL=https://id.lubbalmandumah.com/.well-known/jwks.json`, `LAM_PORTAL_URL=https://account.lubbalmandumah.com`.
8. **Tests/build checks performed**:
   - **LAM**: `npm run build` passed cleanly. `npx tsx scripts/test-lam-sso-foundation.ts` passed 12/12 tests (100%).
   - **NEXORA**: `npm run build` passed cleanly. `npx tsx tests/auth-sso.test.ts` passed 20/20 tests (100%).
   - **Live Production HTTPS Checks**: `curl -s -L https://id.lubbalmandumah.com/.well-known/openid-configuration` returned valid OIDC discovery JSON with issuer `https://id.lubbalmandumah.com`. Root domain `lubbalmandumah.com` returned 308 redirect to `www.lubbalmandumah.com`.
9. **Manual steps required from project owner**: None (Vercel domains, Hostinger DNS, and Supabase database settings have been configured).
10. **Known issues & deferred items**: None.
11. **Exact recommended next step**: Migration complete. System operational on production custom domains.

---

### Stage 13: Customer Accounts CRUD Completion & Details 404 Resolution (2026-08-15)
1. **Current stage and status**: Completed & Live Verified.
2. **What was implemented**:
   - **404 Resolution**: Audited Ecosystem Customer Accounts table (`/control-panel/modules/ecosystem/companies/page.tsx`). Fixed Details button link which previously pointed to an non-existent Ecosystem route. Built dynamic Ecosystem route `/control-panel/modules/ecosystem/companies/[id]`.
   - **Ecosystem Company Profile (`[id]/page.tsx`)**: Built a complete staff-facing Customer Profile displaying:
     - Company Overview (Display Name, Legal Name, Customer Type: Standard/Demo badge, Location, Email, Phone, Website, Status, Created/Updated dates, Assigned Account Manager, Internal Notes).
     - Primary Owner & Account Users (Memberships table with Owner badge, emails, roles, account status, last login timestamps).
     - Product Subscriptions & Entitlements (Product slug, plan tier, max seats, status, expiration dates).
     - SaaS Tenant Instances (NEXORA tenant instance key e.g. `tenant_6c75683e`, environment `production`, instance URL `https://nexora.lubbalmandumah.com`, instance status).
     - Explicit User Product Access Grants (Grants table with user names, emails, product slugs, status, granted dates).
     - Account Activity Log (Timeline of onboarding, entitlement updates, provisioning, and status changes).
   - **Company Edit Modal (`EditCompanyModal.tsx`)**: Built client modal and `updateCompanyDetailsAction` server action allowing authorized staff to update display/legal name, customer type, country/city, website, phone, primary email, status (Active/Suspended/Archived), assigned staff, and internal notes without duplicating company records.
   - **Customer Accounts List Enhancements**: Added prominent gold `+ Onboard New Customer` button linking to `/control-panel/modules/ecosystem/companies/new`. Displayed primary owner details and separate company status vs product entitlement status.
   - **Customer Identities Interlinking**: Updated `/control-panel/modules/ecosystem/identities` (`IdentitiesClient.tsx`) to link assigned organization names directly to `/control-panel/modules/ecosystem/companies/[id]`.
3. **User-visible routes added/changed**:
   - `/control-panel/modules/ecosystem/companies` (Enhanced Customer Accounts Registry)
   - `/control-panel/modules/ecosystem/companies/[id]` (Ecosystem Company Details Profile & Edit Modal)
   - `/control-panel/modules/ecosystem/identities` (Linked Organization names to Company Profile)
4. **Important files created/modified**:
   - `app/control-panel/modules/ecosystem/companies/[id]/page.tsx` [Company Profile Route]
   - `app/control-panel/modules/ecosystem/companies/[id]/EditCompanyModal.tsx` [Edit Company Modal Component]
   - `app/control-panel/modules/ecosystem/companies/page.tsx` [Updated Accounts List]
   - `app/control-panel/modules/ecosystem/identities/IdentitiesClient.tsx` [Interlinked Organization Links]
   - `lib/actions/ecosystem-admin.ts` [Added updateCompanyDetailsAction]
5. **Database changes**:
   - No schema changes required (reused existing `crm_companies`, `customer_company_memberships`, `customer_identities`, `customer_product_entitlements`, `customer_product_instances`, `customer_product_access`, `customer_audit_logs`).
6. **Authentication, roles and permissions**:
   - Governed by `leads_clients` and `user_management` staff permissions. Staff routes remain strictly scoped under `staff.lubbalmandumah.com`.
7. **Environment variables required**: Unchanged.
8. **Tests/build checks performed**:
   - `npm run build`: Exit code 0 (Generated dynamic route `ƒ /control-panel/modules/ecosystem/companies/[id]`).
   - `npx tsx scripts/test-lam-sso-foundation.ts`: 12/12 foundation security tests passed.
   - `git push origin main`: Committed and pushed to `WaseemAkramicloud/Lubb-al-Mandumah-LAM.git` (`commit 1021c8d`).
   - Live HTTPS verification: `curl -s -I https://staff.lubbalmandumah.com/control-panel/modules/ecosystem/companies` returned HTTP 307 redirecting to `/staff-login`. Hostname isolation verified (`www.lubbalmandumah.com` 301 redirects to staff hostname).
9. **Manual steps required from project owner**: None.
10. **Known issues & deferred items**: None.
11. **Exact recommended next step**: Feature complete and verified live on production.

---

### Stage 14: Control Panel Structure, Client Management & CMS Refinement (2026-08-15)
1. **Current stage and status**: Completed & Live Verified.
2. **What was implemented**:
   - **Navigation Restructuring (`SidebarNav.tsx`)**: Reorganized fragmented sidebar into 4 business-focused groups (`OVERVIEW`: Dashboard; `BUSINESS`: Clients, Products & Subscriptions; `WEBSITE`: Website Management; `ADMINISTRATION`: Staff Users, Audit Log, System Settings, My Profile). Removed "Ecosystem Admin" as a primary name while preserving underlying permissions and functionality.
   - **Executive Dashboard (`dashboard/page.tsx` & `DashboardGrid.tsx`)**: Refined dashboard with 6 high-level metric cards: Total Clients, Active Subscriptions, Products, New/Pending Requests, Expiring Subscriptions, and Pending Actions.
   - **Central Clients Hub (`companies/page.tsx`)**: Rebuilt Clients landing page with top business tabs (Existing Clients, Onboard New Client, Client Users, Requests/Leads). Updated primary table action to `Manage →`.
   - **Client Control Centre & Safe Editing (`companies/[id]`)**: Enhanced central client management profile with Overview, Users & Permissions, Products & Subscriptions, Product Workspace (NEXORA tenant reference), and Activity tabs. Updated `EditCompanyModal.tsx` to enforce **Edit → Review Changes (Current Value → New Value) → Confirm Update**.
   - **Onboard New Client Flow (`companies/new/OnboardingForm.tsx`)**: Added a **Review New Client Setup** summary step prior to execution with double-click and page refresh guards.
   - **Ecosystem Subscriptions Hub (`entitlements/EntitlementsClient.tsx`)**: Updated subscriptions view to link client company names directly back to their Client Control Centre (`/control-panel/modules/ecosystem/companies/[id]`).
   - **Website CMS & Publishing Workflow (`site-management`)**: Visual page section card grid mapped directly to `cms_pages` and `cms_sections`. Section content editor supports **Edit → Preview/Review → Publish to Live Site** workflow.
3. **User-visible routes added/changed**:
   - `/control-panel/dashboard` (Executive Dashboard)
   - `/control-panel/modules/ecosystem/companies` (Clients Hub)
   - `/control-panel/modules/ecosystem/companies/[id]` (Client Control Centre with Review → Confirm)
   - `/control-panel/modules/ecosystem/companies/new` (Client Onboarding with Review Step)
   - `/control-panel/modules/ecosystem/entitlements` (Products & Subscriptions Hub)
   - `/control-panel/modules/site-management` (Non-Technical Website Management CMS)
4. **Important files created/modified**:
   - `components/layout/SidebarNav.tsx` [Grouped Navigation]
   - `app/control-panel/dashboard/page.tsx` & `DashboardGrid.tsx` [Metric Cards]
   - `app/control-panel/modules/ecosystem/companies/page.tsx` [Clients Hub & Manage Action]
   - `app/control-panel/modules/ecosystem/companies/[id]/page.tsx` [Client Control Centre]
   - `app/control-panel/modules/ecosystem/companies/[id]/EditCompanyModal.tsx` [Review Changes Flow]
   - `app/control-panel/modules/ecosystem/companies/new/OnboardingForm.tsx` [Review New Client Setup]
   - `app/control-panel/modules/ecosystem/entitlements/EntitlementsClient.tsx` [Client Subscriptions Links]
   - `LAM_WEB_CONTROL_PANEL_MASTER_LOG.md` [Master Record Update]
5. **Database changes**:
   - No database schema changes introduced. Reused existing `crm_companies`, `customer_company_memberships`, `customer_identities`, `customer_product_entitlements`, `customer_product_instances`, `cms_pages`, `cms_sections`, and `staff_profiles`.
6. **Authentication, roles and permissions**:
   - Preserved 100% of staff auth, permissions checks (`canAccess`), LAM ID, OIDC/SSO, RS256/JWKS, and domain/host isolation.
7. **Environment variables required**: Unchanged.
8. **Tests/build checks performed**:
   - `npm run build`: Exit code 0 (Compiled successfully across static and dynamic routes).
   - `npx tsx scripts/test-lam-sso-foundation.ts`: Passed 12/12 foundation security tests (100%).
   - `git push origin main`: Pushed commit `b6b9cfd` to `WaseemAkramicloud/Lubb-al-Mandumah-LAM.git`.
9. **Manual steps required from project owner**: None.
10. **Known issues & deferred items**: None.
11. **Exact recommended next step**: Refinement complete. System operational on production domain `https://staff.lubbalmandumah.com`.
