# Adoracle

Unified ad management for Meta, TikTok, Google, YouTube and LinkedIn: dashboard, per-platform management,
one-setup multi-platform campaign builder, post-publish ad management, social posting (photos, videos, Reels),
AI insights and automation, SEO & link safety, and safe account connections.

## Project structure

```
prisma/                      Database schema
src/
  app/                       Next.js ROUTES ONLY (thin files that point to frontend views / backend handlers)
    (app)/…/page.tsx           → export { default } from '@/frontend/views/…'
    api/…/route.ts             → export { GET, POST } from '@/backend/handlers/…'
  frontend/                  Everything the browser shows
    views/                     One folder per screen (dashboard, platforms, builder, campaigns, posts,
                               intelligence, seo, settings, profile, help, planner, studio, auth)
    components/                layout/ common/ connections/ media/ campaigns/ dashboard/ ui/
    context/                   Theme, Mode, User
    hooks/                     useConnections
    styles/                    globals.css
  backend/                   Everything that runs on the server
    handlers/                  API logic (one file per feature)
    services/                  Business logic (adManagement, seoService, intelligenceService, publisher, crawler…)
    integrations/              oauth.ts, verify.ts, tokens.ts, connectors/
    auth/                      Auth.js config (index.ts) + session helpers (session.ts)
    db/                        Prisma client + workspace helpers
    security/                  AES-256-GCM token encryption
  shared/                    Code used by BOTH sides: adspec.ts (platform rules), blueprint.ts,
                             connectFeatures.ts (permissions + agreement), types.ts, demoData.ts
```

## 1. Environment variables

See `.env.example`. Minimum for login: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `TOKEN_ENCRYPTION_SECRET`.
Then create the tables (from your computer) and redeploy:

```bash
npm install
npx prisma db push
```

| Feature | Variables |
|---|---|
| Upload from device (photos, videos, Reels) | `BLOB_READ_WRITE_TOKEN` (Vercel → Storage → Blob) |
| Scheduled posts + automation rules | `CRON_SECRET` (daily jobs are in `vercel.json`; Vercel Pro allows hourly) |
| AI-written ad copy | `ANTHROPIC_API_KEY` (optional, templates are used otherwise) |
| Meta / Google Ads / TikTok / LinkedIn | see section 3 |

## 2. Login
Google and email + password. Signing in with Google links to an existing account with the same email. App pages are protected on the server.

## 3. Connecting accounts (made simple for users)
Users click **Connect**, tick what Adoracle may do (create ads, show results, publish posts, pick existing posts), read and accept an agreement, sign in on the platform's own page, and Adoracle then **asks the platform itself** to confirm the login and exactly which permissions were granted. Missing permissions can be re-requested in one click. The accepted agreement is stored (Settings → Privacy & data). Disconnecting deletes the saved login and revokes access on Meta/Google where possible. The screen re-verifies every connection each time it is opened.

You (the site owner) register one developer app per platform. Redirect URL for each: `https://YOUR-DOMAIN/api/connect/<meta|google|tiktok|linkedin>/callback`.

| Platform | Console | Env vars |
|---|---|---|
| Meta | developers.facebook.com (Marketing API, Pages, Instagram) | `META_APP_ID`, `META_APP_SECRET` |
| Google Ads + YouTube | Google Cloud + Google Ads developer token | `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN` |
| TikTok | business-api.tiktok.com | `TIKTOK_APP_ID`, `TIKTOK_APP_SECRET` |
| LinkedIn | linkedin.com/developers | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` |

Platforms require app review before accounts outside your own can connect.

## 4. What is real vs. sample
* **Real:** login, profile, settings, team invites, connections + verification + consent, media upload, existing-post picker (Facebook, Instagram, YouTube), campaign builder, saved Campaign › Ad set › Ad rows with edit / pause / duplicate / delete / bulk edit, Meta + TikTok campaign creation (created **paused**) and campaign pause/resume sync, Facebook Page + Instagram posting (photos, videos, Reels), website audit, link checker + Link Guard auto-pause, insights, one-click actions, automation rules, ad copy writer, website scan.
* **Sample data:** dashboard and platform metrics until live reporting sync is added.
* **Saved as drafts:** Google, YouTube and LinkedIn campaign pushes; TikTok, YouTube and LinkedIn posts; ad set / ad level pushes to platforms.
