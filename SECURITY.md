# EARTHWORM Security Architecture & Privacy Controls

## 1. Overview & Scope
EARTHWORM is a working SIH prototype application designed to explore agricultural price discovery, AI produce quality evaluation, shared logistics, and escrow dispute workflows. This document details the security practices, architectural isolation patterns, and privacy-by-design considerations implemented within this prototype.

> **Prototype Notice:** This software is an evaluation prototype. While production-inspired security controls (such as server-side API key isolation, CORS restrictions, and input escaping) have been implemented, production deployment would require formal security audits, enterprise Identity/SSO (e.g. AgriStack / DigiLocker), and hardware security module (HSM) banking integration.

---

## 2. API Key Isolation & Serverless Architecture
To prevent API key exposure in client bundles, all third-party API communication is isolated on serverless edge functions:

```
[Client Browser]
       │
       │  POST /api/gemini  (Restricted CORS: Same-origin / Localhost / Deployed domain)
       │  GET  /api/agromarket
       ▼
[Serverless API Layer (Node.js)]
  ├── Reads process.env.GEMINI_API_KEY
  ├── Reads process.env.DATA_GOV_API_KEY
  ├── Restricts HTTP methods (POST/GET) & payload size (<10MB)
  └── Adds edge caching headers (300s TTL for Agmarknet)
       │
       ▼
[Upstream Providers]
  ├── Google Gemini API (gemini-2.5-flash / gemini-1.5-flash)
  └── Open Government Data (Data.gov.in Agmarknet API)
```

### Implemented Controls:
- **API Keys Isolated Server-Side:** No Google Gemini or Data.gov.in API keys are bundled or stored in client-side code or browser `localStorage`.
- **Restricted CORS Policy:** Origin headers are validated against deployed Vercel domains and local development environments (`localhost`, `127.0.0.1`), avoiding open wildcard (`*`) access.
- **Offline & Demo Fallback:** If serverless endpoints or external networks are unavailable, client services smoothly activate localized contextual simulations without throwing runtime exceptions.

---

## 3. Privacy-by-Design & DPDP-Aligned Considerations
The prototype integrates design patterns aligned with principles of the **Digital Personal Data Protection (DPDP)** framework:

1. **Producer Anonymity on Public Marketplace:**
   - Farmer profiles are listed using tokenized pseudo-identifiers (e.g., `#EW-TN-8842`).
   - Personal phone numbers and home addresses are omitted from buyer lot cards.
2. **Prototype Authentication & Session Management:**
   - Designed for demonstration workflows with 1-touch fast-track evaluation.
   - Plaintext passwords are not stored in browser storage; tokenized session keys are used for prototype state persistence.
   - *Production Roadmap:* Replace prototype authentication with government-backed Single-Sign-On (AgriStack ID / DigiLocker / Aadhaar OTP).
3. **Escrow & Settlement Auditability (Conceptual):**
   - 24-hour statutory SLA tracking is modeled after standard APMC Form 8 settlement procedures.

---

## 4. Input Sanitization
- Dynamic user inputs (names, queries, commodity types) are filtered through `SecurityUtils.escapeHtml()` to encode HTML control characters (`&`, `<`, `>`, `"`, `'`, `/`) prior to template insertion.
- Form inputs apply basic text sanitization to reduce injection risks.

---

## 5. HTTP Security Headers
Configured in `vercel.json` for web deployment:
- `X-Content-Type-Options: nosniff` — Discourages MIME sniffing.
- `X-Frame-Options: SAMEORIGIN` — Restricts framing to same origin.
- `X-XSS-Protection: 1; mode=block` — Enables legacy browser XSS filters.
- `Referrer-Policy: strict-origin-when-cross-origin` — Restricts referrer transmission.
- `Permissions-Policy: camera=*, microphone=*, geolocation=*` — Scopes device permissions for GIS map and AI camera capture.

---

## 6. Computer Vision Provenance Check
The buyer portal inspection workflow prompts the multimodal Gemini vision model to perform a visual authenticity evaluation:
- Evaluates on-farm lighting, crate geometry, and texture naturalness to distinguish real camera captures from stock or synthetic images.

---

## 7. Supabase Authentication & Row Level Security (RLS)
- **Supabase Auth Engine:** User authentication is managed via Supabase Auth with bcrypt-hashed credentials stored in secure auth tables.
- **Deterministic Zero-PII Mapping:** User IDs and GSTINs are mapped into internal auth emails (`ew_tn_8842@earthworm.internal`) to maintain a clean User ID + PIN experience in the UI while securing API requests with bearer tokens.
- **Row Level Security (RLS):** All 6 tables (`profiles`, `farms`, `lots`, `transactions`, `grievances`, `quality_scans`) enforce granular RLS policies ensuring users can only modify their own authorized records.
- **No Plaintext Passwords in Storage:** Browser `localStorage` strictly contains only UI preferences and active session tokens.

---

## 8. Summary of Implemented Controls

| Domain | Implemented Control | Prototype Classification |
| :--- | :--- | :--- |
| **API Keys** | Server-side environment isolation via `/api/*` | Production-Standard Pattern |
| **Backend Database** | Supabase PostgreSQL with Row Level Security (RLS) | Production-Standard Pattern |
| **Authentication** | Supabase Auth + Deterministic User ID Mapping | Production-Standard Pattern |
| **CORS** | Restricted to origin / localhost / deployed host | Production-Standard Pattern |
| **Input Handling** | HTML entity escaping (`SecurityUtils.escapeHtml`) | Basic Sanitization |
| **Data Privacy** | Anonymized farmer IDs on buyer listings (DPDP) | Privacy-by-Design Alignment |
| **Offline Handling** | High-accuracy vernacular benchmark fallback | Demo Resilience Feature |

