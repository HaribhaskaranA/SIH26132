# EARTHWORM: Agricultural Market Linkages & Price Discovery Platform

> **Empowering Indian Farmers with Real-Time APMC Price Discovery, Multimodal AI Quality Grading, Shared Logistics, and 24-Hour Escrow Settlements.**

---

## 🌾 Overview
**EARTHWORM** is an agricultural market linkage and price discovery prototype designed for the Ministry of Agriculture & Farmers Welfare to explore technical solutions for agricultural market gluts, middleman margin compression, and delayed payment defaults. Built with privacy-by-design considerations and 5-language vernacular support, EARTHWORM simulates direct connections between smallholder farmers and institutional buyers, exporters, and APMC mandis.

---

## 🌟 Key Features & Capabilities

### 1. 🌐 5-Language Vernacular Multilingual Engine
- Full real-time vernacular localization across **English 🇬🇧, தமிழ் (Tamil) 🇮🇳, हिन्दी (Hindi) 🇮🇳, తెలుగు (Telugu) 🇮🇳, and ಕನ್ನಡ (Kannada) 🇮🇳**.
- Live Speech Recognition (STT) and Vernacular Speech Synthesis (TTS) via Web Speech API.

### 2. 🗺️ Interactive Satellite GIS & Digital Farm Twin
- Interactive boundary polygon mapping via **Leaflet.js** and **Turf.js** area computations.
- Geospatial diagnostics integrating ISRO Bhuvan soil telemetry (pH, soil type) and Sentinel-2 canopy vigor (NDVI index).

### 3. 🤖 Multimodal AI Produce Assaying & Image Forensics
- Computer vision quality grading leveraging **Google Gemini 2.5/1.5 Flash**.
- Automated classification into **AGMARK Grade A (Premium Supermarket)**, **Grade B (Commercial APMC)**, and **Grade C (Industrial Food Processing / Pulping)**.
- **Image Authenticity & Provenance Check:** Visual forensic audit verifying genuine on-farm camera captures vs synthetic/AI-generated spoofed images.

### 4. 📈 Real-Time Data.gov.in Agmarknet Market Radar
- Live wholesale modal price ingestion for agricultural commodities across Tamil Nadu and regional APMCs.
- **Net Realization Index:** Computes net farmer income per kilogram after deducting real-time logistics freight and transit toll costs.

### 5. 🚚 Shared Ride-Pooling & Logistics Optimizer
- Dynamically matches nearby farmers headed to the same APMC terminal.
- Achieves up to **64% reduction in per-kilogram freight costs** (from ₹3.60/kg to ₹1.30/kg).

### 6. ❄️ Cold Storage Buffer & Holding Economics
- What-If calculator demonstrating storage holding returns versus selling into distress mandi gluts.
- Instant bay allocation (#BAY-TN-3310 at 3.5°C) with subsidized government storage rates.

### 7. ⚖️ APMC Form 8 Grievance & Dispute Resolution
- Automated legal docket generation under the Agricultural Produce Marketing (Regulation) Act.
- Real-time statutory 24-hour dispute escalation tracker.

### 8. 📜 24-Hour Statutory Escrow & DBT Settlement Hub
- Real-time 4-stage payment tracking from weighbridge gross tare deduction to RBI DBT bank credit.
- GPS Share PIN for live truck transit telemetry tracking.

### 9. 🏢 Institutional Buyer Procurement Gateway
- Corporate procurement portal for supermarket chains (e.g. Reliance Fresh, BigBasket) to inspect verified lots, review Gemini AI audit dockets, and fund escrow pools.

---

## 🔒 Security & Privacy Controls
- **API Keys Isolated Server-Side:** API keys (`GEMINI_API_KEY`, `DATA_GOV_API_KEY`) are isolated on serverless backends (`/api/gemini`, `/api/agromarket`) and never bundled in client code or browser `localStorage`.
- **Restricted CORS:** Cross-origin access is restricted to deployed frontend domains and local development environments.
- **DPDP-Aligned Design Considerations:** Tokenized identifiers (`#EW-TN-8842`) protect producer privacy on the buyer marketplace.
- **Prototype Authentication:** Tokenized session state prevents storing plaintext passwords in browser storage during evaluation.
- **Input Sanitization Implemented:** HTML entity escaping via `SecurityUtils.escapeHtml()` reduces cross-site scripting risks.
- **Offline Resilience:** Graceful zero-crash client-side simulation when running offline or without live backend credentials.

---

## 📁 Codebase Architecture

```
earthworm_mobile/
├── index.html                   # Master mobile shell, header, bottom nav & viewport
├── vercel.json                  # Serverless route rewrites and HTTP security headers
├── .env.example                 # Environment configuration template
├── .gitignore                   # Excluded files and secrets
├── SECURITY.md                  # Detailed security and privacy documentation
├── README.md                    # Project documentation and quickstart
│
├── api/                         # Serverless Edge Endpoints (Node.js)
│   ├── gemini.js                # Google Gemini text & multimodal vision proxy (Restricted CORS)
│   └── agromarket.js            # Data.gov.in Agmarknet prices proxy & cache (Restricted CORS)
│
├── css/
│   └── mobile_style.css         # Mobile-first responsive design, typography & widgets
│
├── utils/
│   └── security_utils.js        # HTML escaping, sanitization & prototype auth tokenization
│
├── services/
│   ├── i18n_service.js          # 5-language dictionary & speech language bindings
│   ├── gemini_service.js        # Gemini AI client calling /api/gemini with offline fallback
│   └── agro_data_service.js     # Farm registry, lot publishing & APMC pricing
│
├── screens/                     # 13 Modular UI Screens
│   ├── 00_auth_login.js         # Unified portal login, role switch & buyer onboarding
│   ├── 01_auth_register.js      # Farmer onboarding with GIS polygon boundary drawing
│   ├── 01_farm_sim_map.js       # Satellite NDVI, soil health & farm digital twin
│   ├── 02_home_dashboard.js     # Master farm summary, live prices & quick navigation
│   ├── 03_crop_budget.js        # Interactive cost calculator & break-even simulator
│   ├── 04_quality_grading.js    # Camera scan & computer vision AGMARK grading
│   ├── 05_cold_storage.js       # Holding time economics & cold bay booking
│   ├── 06_ride_pooling.js       # Shared truck freight coordinator (64% cost reduction)
│   ├── 07_market_radar.js       # Mandi glut radar & net realization price index
│   ├── 08_ai_voice_assistant.js # Vernacular Gemini voice & text advisor
│   ├── 08_grievance_ai.js       # APMC Form 8 dispute docket generator & SLA clock
│   ├── 09_transactions_hub.js   # Master invoices, GPS PIN tracker & Escrow ledger
│   └── 10_buyer_portal.js       # Institutional procurement, audit & weighbridge
│
└── assets/                      # Static logos, sample produce images and icons
```

---

## 🚀 Quickstart & Local Development

### Option 1: Static / Offline Evaluation Mode
You can run the application directly using any local web server:

```bash
# Using Python built-in HTTP server
cd earthworm_mobile
python -m http.server 8080

# Open in browser: http://localhost:8080
```
*Note: In static mode without a serverless backend, all Gemini AI advice, visual quality grading, and market rates run on high-precision contextual vernacular simulations.*

---

### Option 2: Full Serverless Mode (with Live Gemini & Govt APIs)

1. **Clone or navigate to the directory:**
   ```bash
   cd earthworm_mobile
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and supply your GEMINI_API_KEY and DATA_GOV_API_KEY
   ```

3. **Run with Vercel CLI:**
   ```bash
   npx vercel dev
   ```

4. **Deploy to Vercel in 1-Click:**
   ```bash
   npx vercel --prod
   ```
   *In the Vercel project dashboard, set `GEMINI_API_KEY` and `DATA_GOV_API_KEY` under Settings ➔ Environment Variables.*

---

## 🗄️ Supabase Backend & Database Architecture

EARTHWORM connects to **Supabase** for user authentication and relational database synchronization across 6 core tables:

### 1. Database Tables Overview (`database_schema.sql`)
- **`profiles`**: Stores account metadata for both Farmers and Institutional Buyers (Role, User ID, GSTIN, FSSAI, Phone, District, Language).
- **`farms`**: Digital farm twins, GIS boundaries, acreage, soil pH, NDVI canopy vigor, and expected yields.
- **`lots`**: Live produce lots published for institutional marketplace bidding.
- **`transactions`**: 24-hour statutory escrow settlements, DBT payout records, UTR numbers, and GPS tracking PINs.
- **`grievances`**: APMC Form 8 dispute dockets with statutory 24-hour resolution SLA tracking.
- **`quality_scans`**: Google Gemini AI multimodal quality grading records, chromatic ripeness, morphometric caliber, and defect percentages.

### 2. User ID & Password Auth Mapping
The UI remains strictly **User ID / GSTIN + Password/PIN** (e.g. `EW-TN-8842` / `4820` or `33AAACR4820M1Z8` / `9021`). Under the hood, `SupabaseService` maps User IDs to deterministic internal auth emails (e.g. `ew_tn_8842@earthworm.internal`) without exposing email addresses in the UI.

### 3. Setting Up Supabase
1. Open your Supabase Dashboard: **SQL Editor** ➔ Paste the contents of [`database_schema.sql`](file:///C:/Users/HARIBHASKARAN%20A/.gemini/antigravity/brain/42dab28e-3b4e-4192-b5a4-8ecf05eb1ebf/earthworm_mobile/database_schema.sql) ➔ Click **Run**.
2. Set your environment variables in `.env` or Vercel Dashboard:
   - `SUPABASE_URL=https://kgqnekyydywlggnwlpjg.supabase.co`
   - `SUPABASE_PUBLISHABLE_KEY=sb_publishable_4iCCs2Xl-PYMlYm5iZYylg_ryvXeAOk`

---

## 👥 Demo Fast-Track Access
For rapid evaluation, 1-touch demo fast-track buttons are built directly into the login screen:
- **👨‍🌾 Farmer Demo:** Pre-authenticated as Farmer `#EW-TN-8842` (Coimbatore District, 2.5-acre Tomato farm, PIN: `4820`).
- **🏢 Buyer Demo:** Pre-authenticated as Reliance Fresh Central Agri Procurement (`33AAACR4820M1Z8`, PIN: `9021`).

