# 🚀 Adoracle — Full-Stack Multi-Platform Ad Management & Business Intelligence SaaS

Adoracle unifies cross-platform advertising management across Meta, TikTok, Google/YouTube, and LinkedIn, combining live budget reallocation, AI learning loops, and pre-launch safety guards into a single high-performance web application.

---

## 🎨 Visual Design System & Brand Palette
- **Logo**: Geometric light-blue "A" icon with a top-right AI sparkle next to the bold white **Adoracle** wordmark.
- **Primary Brand**: Sky Pulse (`#38BDF8`) & Deep Sky (`#0284C7`)
- **Surfaces**: Pure White (`#FFFFFF`) cards on a Frost White (`#F8FAFC`) canvas.
- **Structure**: Obsidian Black (`#0F172A`), Slate Gray (`#475569`), Cloud Line (`#E2E8F0`).
- **Status Indicators**: Emerald Green (`#10B981`), Amber Gold (`#F59E0B`), Crimson Red (`#EF4444`).

---

## 🏗️ Architecture & Modules

1. **Global Layout & Mode Switcher (`/dashboard`)**:
   - **Plain Language Mode**: Translates technical jargon into straightforward business numbers (e.g., "Customers Won", "Cost Per Customer", "Net Profit After Ads").
   - **Expert Mode**: Instantly updates metrics to professional marketing terms (ROAS, CPA, CPM, CTR, Frequency).
2. **Action Center ("3 Things to Fix Today")**:
   - Prioritized operational alerts for broken checkout links and tracking issues with one-click resolution.
3. **Cross-Platform Spend & Performance Chart**:
   - Grouped performance bar chart comparing spend, customers, and efficiency across Meta, TikTok, Google, YouTube, and LinkedIn.
4. **Business Profiler & Hybrid Platform Selector (`/selector`)**:
   - Headless site crawler extracts offerings, pricing tier, audience, and reach.
   - Explicit **"Where NOT to Spend"** advisory box shields users from expensive native ad manager traps.
   - 4-toggle parameter engine for Buyer Type (B2C/B2B), Intent (Search/Scrolling), Price Point, and Monthly Budget using the **70/30 allocation rule**.
5. **Granular Platform Studio (`/studio`)**:
   - **Meta & Instagram**: Objectives, CBO/ABO controls, placements, and CAPI mapping.
   - **TikTok Ads**: Spark Ads authorization, hashtag targeting, and Events API mapping.
   - **Google & YouTube**: Search RSA, PMax, YouTube Shorts, match types, and negative keyword shields.
   - **LinkedIn B2B**: Verified job seniority gating, company size filters, and native 1-click lead forms.
6. **Cross-Platform Campaign Manager (`/campaigns`)**:
   - **Unified Budget Control Bar**: Real-time interactive master allocation bar.
   - **Master Campaign Data Grid**: Inline daily budget sliders, status pills, and AI auto-optimize switches.
7. **AI Learning Loop (`/intelligence`)**:
   - **Prediction Scorecard**: Longitudinal line chart tracking Predicted vs. Actual CPA convergence with a live 94.2% accuracy rating.
   - **Client Knowledge Base**: Validated winning patterns and copy heuristics.
8. **Web SEO Audit & Pre-Launch Safety Guard (`/seo`)**:
   - **Crimson Red Pre-Launch Banner**: Detects broken checkout links before ad spend goes live, with instantaneous **"Auto-Fix Redirects"** action.
   - **Site Health Score**: Interactive 88/100 gauge, Core Web Vitals checks, and commercial Keyword Rank Tracker.

---

## 🔒 Security & Connectors
- **AES-256 Token Vault (`src/lib/encryption.ts`)**: Encrypts and decrypts OAuth access tokens at rest.
- **Modular Adapters (`src/lib/connectors/`)**: Strict `PlatformConnector` implementation for Meta, TikTok, Google, and LinkedIn.
- **Prisma Schema (`prisma/schema.prisma`)**: Exact relational schema for Workspaces, Tokens, Business Profiles, Campaigns, Lessons, and SEO Audits.

---

## 🛠️ Quick Start

```bash
cd C:\Users\USER\.gemini\antigravity\scratch\adoracle

# Run development server
pnpm run dev

# Or build and launch production server
pnpm run build
pnpm run start
```
Open [http://localhost:3000](http://localhost:3000) to access the Adoracle platform.

