# LAM Web Control Panel - Master Log

> **AI ORIENTATION INSTRUCTION:**
> Before making any change, read this `LAM_WEB_CONTROL_PANEL_MASTER_LOG.md` and inspect the current code relevant to the requested change. Treat this master log as orientation, not as a substitute for verifying the actual code/database state. Make only the requested change, preserve established LAM Web Control Panel architecture and permission boundaries, run relevant checks, then update the CURRENT STATUS and append a dated maintenance entry to this same `LAM_WEB_CONTROL_PANEL_MASTER_LOG.md`. Do not create another progress/status Markdown file.

## 🎯 CURRENT STATUS
- **Phase 1 (Foundation to Security Review)** is **Completed** (Stages 1–9).
- **Phase 2, Stage 1 (Full Website Content Audit)** is **Completed**. 
- **Phase 2, Stage 2 (CMS Data Model & Content Migration)** is **Completed**.
- **Phase 2, Stage 3 (Site Management UI Rebuild)** is **Completed**.
- **Phase 2, Stage 4 (Component-Specific Editors & Media Integration)** is **Completed**.
- **Phase 2, Stage 5 (Master Content Modules & Website References)** is **Completed**.
- **Phase 2, Stage 6 (Editorial Workflow, Security & Production Validation)** is **Completed**.
- **Phase 3 (Future-Proofing Products & CRM Foundations)** is **Completed** (2026-08-11).
- **Phase 4, Instruction 1 of 5 (LAM ID, Customer Identity & SSO Foundation)** is **Completed** (2026-08-11).
- **Phase 4, Instruction 2 of 5 (Minimal Customer Account Portal & Direct Product Access)** is **Completed** (2026-08-11).
- **Phase 4, Instruction 3 of 5 (Extend Internal LAM Control Panel for Ecosystem Administration)** is **Completed** (2026-08-11).
- **Phase 4, Instruction 4 of 5 (Final LAM SSO / Control-Plane QA & Handover Contract)** is **Completed** (2026-08-11).
  - Executed comprehensive security and architectural QA across all 4 entry surfaces (Public Marketing Site, Staff Web Control Panel, Customer Account Portal, and LAM ID SSO Server).
  - Verified open redirect protection: `redirect_uri` validated against `sso_applications`, `return_to` sanitized in `customerLogin()`.
  - Created standard **Architecture & Integration Handover Contract** ([docs/LAM_SSO_HANDOVER_CONTRACT.md](file:///Users/waseemakram/My%20Comp%20Data/Lubb%20al%20Mandumah%20LAM/docs/LAM_SSO_HANDOVER_CONTRACT.md)) detailing OIDC endpoints, JWT claims, security rules, and child SaaS integration steps.
  - Verified static/dynamic build across all 35 routes. Zero breaking changes.

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
