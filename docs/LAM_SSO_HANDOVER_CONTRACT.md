# LAM ID — Central SSO & Identity Handover Contract

> **Document Version**: 1.0.0 (Final Architecture & Security QA)  
> **Target Audience**: Core Platform Engineers & Developers building LAM SaaS Products (NEXORA, ATOM, PointO, etc.)

---

## 🏛️ 1. Architecture Overview & Entry Model

The Lubb al-Mandumah (LAM) platform follows a strict **decoupled control-plane architecture**:

```
                                 ┌────────────────────────┐
                                 │   www.lam.com (Public) │
                                 └───────────┬────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
          ┌──────────────────────────┐               ┌──────────────────────────┐
          │  /control-panel (Staff)  │               │     /id/* & /portal      │
          │   Staff-Only CMS/CRM     │               │   LAM ID Customer SSO    │
          └──────────────────────────┘               └─────────────┬────────────┘
                                                                   │
                                           ┌───────────────────────┼───────────────────────┐
                                           ▼                       ▼                       ▼
                                   ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
                                   │ NEXORA SaaS   │       │   ATOM SaaS   │       │  PointO SaaS  │
                                   │ (nexora.lam)  │       │  (atom.lam)   │       │ (pointo.lam)  │
                                   └───────────────┘       └───────────────┘       └───────────────┘
```

### Logical Boundaries & Roles

1. **`www.lam.com`**: Public marketing and corporate CMS site only.
2. **`control/staff portal`** (`/control-panel`): Internal `@lamweb.com` staff-only administration surface for CMS, CRM, Users, and Ecosystem Admin. Uses standard password auth; **completely isolated** from customer accounts.
3. **`login.lam.com` / `/id/*`**: Central LAM ID customer identity & SSO authorization server.
4. **`portal.lam.com` / `/portal`**: Customer account portal (company info, entitlement status, team access management, direct SaaS launcher).
5. **Operational SaaS Applications** (`nexora.lam.com`, `atom.lam.com`, etc.): Independent product applications. **Each serious SaaS keeps its own Supabase project/database** and internal product RBAC.

---

## 🔐 2. Access Rule Model

> **Access Authorization Rule**:
> - **LAM ID** decides ***WHETHER*** a customer may enter a product application.
> - **The child SaaS product** decides ***WHAT*** the customer may do inside that product application.

### Multi-Layered Product Authorization Rule

Before issuing an authorization code or SSO token for a target `product_slug`, LAM ID verifies:
1. **Active Identity Check**: Customer identity exists and status is `active` (not suspended).
2. **Active Membership Check**: Customer is an active member of a customer organization (`crm_companies`).
3. **Active Entitlement Check**: The organization holds an `active` product subscription (`customer_product_entitlements`).
4. **Explicit User Access Check**: The customer user holds an **explicit user-level product access grant** (`customer_product_access`).  
   *(Note: Being an organization member alone does NOT grant access to every product. Access must be explicitly granted per user).*

---

## 📡 3. Central OIDC / OAuth 2.0 API Endpoints

Child SaaS applications MUST consume the following standard OIDC endpoints provided by LAM ID:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sso/authorize` | `GET` | Authorization Endpoint (Initiates SSO / validates session & explicit access) |
| `/api/sso/token` | `POST` | Token Exchange Endpoint (Exchanges authorization code for signed JWT tokens) |
| `/api/sso/userinfo` | `GET/POST` | OIDC UserInfo Endpoint (Returns authenticated user profile & granted products) |
| `/api/sso/validate` | `POST` | Direct API Token Validation Endpoint for child SaaS backends |
| `/.well-known/jwks.json` | `GET` | Public JWKS Discovery Endpoint for JWT signature verification |

---

## 📄 4. JWT Token Claims Contract

When exchanging an authorization code at `/api/sso/token`, LAM ID issues a signed **HMAC-SHA256 (HS256)** OIDC ID Token and Access Token.

### Payload Schema:

```json
{
  "iss": "https://lam.com",
  "sub": "b2c8a1e4-3f91-4e89-9a12-8f1d7e2c9001",
  "aud": "lam_app_nexora",
  "email": "user@acme.com",
  "first_name": "Sarah",
  "last_name": "Connor",
  "company_id": "c1f72e90-821d-4001-a123-5e9b8f3d1002",
  "company_role": "admin",
  "products": ["nexora", "atom"],
  "exp": 1786200000,
  "iat": 1786196400,
  "jti": "jti_4a91b2c3d4e5"
}
```

### Claim Definitions:
- `sub` (string): Permanent, stable UUID of the customer identity (independent of email address).
- `company_id` (string): UUID of the customer organization in LAM CRM.
- `company_role` (string): Customer role within organization (`owner`, `admin`, `member`).
- `products` (array of strings): List of product slugs explicitly granted to this user.

---

## 🛠️ 5. Step-by-Step Child SaaS Integration Guide

### Step 1: Unauthenticated Request Interception
When an unauthenticated user visits `nexora.lam.com/dashboard`:
Redirect the user to the LAM ID authorization endpoint:
```http
GET https://lam.com/api/sso/authorize?client_id=lam_app_nexora&product=nexora&redirect_uri=https://nexora.lam.com/auth/callback&state=XYZ123
```

### Step 2: LAM ID SSO Authorization
- If unauthenticated at LAM ID, the user is prompted to log in at `/id/login`.
- LAM ID verifies active account, active entitlement, and explicit user grant for `nexora`.
- Upon successful validation, LAM ID redirects back to the child SaaS callback:
```http
302 Redirect -> https://nexora.lam.com/auth/callback?code=code_9a8b7c6d5e4f3a2b&state=XYZ123
```

### Step 3: Authorization Code Exchange
The child SaaS backend makes a POST request to exchange the code for JWT tokens:
```http
POST https://lam.com/api/sso/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "code_9a8b7c6d5e4f3a2b",
  "client_id": "lam_app_nexora",
  "redirect_uri": "https://nexora.lam.com/auth/callback"
}
```

### Step 4: Token Validation & Local Session Creation
- Verify token signature using `/.well-known/jwks.json` or direct validation at `https://lam.com/api/sso/validate`.
- Upsert local user record in NEXORA database using `sub` (LAM customer UUID) as external key.
- Assign internal NEXORA application roles/permissions based on NEXORA's own database rules.
- Set NEXORA local session cookie.

---

## 🔒 6. Security Assurance & Non-Negotiable Rules

1. **No Operational Data in LAM**: NEXORA leads, ATOM financial ledgers, PointO transactions, etc., remain exclusively in child SaaS databases.
2. **Open Redirect Prevention**: `redirect_uri` is strictly validated against `sso_applications.redirect_uris`. Unregistered redirect URIs are rejected instantly. `return_to` parameter is sanitized.
3. **Single-Use Authorization Codes**: `sso_auth_codes` are invalidated immediately upon first use and expire in 10 minutes.
4. **Immediate Revocation**: Suspending a customer account in Staff Control Panel immediately blocks SSO authorization and token validation attempts.
5. **No Secret Exposure**: Signing secrets and service keys are protected server-side and never exposed to browser bundles.
