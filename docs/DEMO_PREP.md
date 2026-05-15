# Demo Preparation — AIControlCenter

## 4 Preparation Questions

### 1. What problem does AIControlCenter solve, and who is it for?

Enterprise teams adopt many AI tools (OpenAI, Anthropic, Copilot, Cursor, Slack AI, internal agents) without unified visibility into spend, ROI, or waste. Finance and engineering leaders cannot defend AI budgets in executive meetings because data lives in separate vendor dashboards.

**AIControlCenter** is an enterprise SaaS intelligence platform for AI Platform teams, engineering managers, and CTOs. It unifies cost, usage, and ROI across tools and teams, surfaces AI-generated insights and optimization recommendations, and answers natural-language questions—all from pre-aggregated metrics, never raw logs.

### 2. How does the AI layer work without exposing sensitive data?

The AI layer uses **Claude Sonnet 4** on three routes: `/api/analyze`, `/api/query`, and `/api/ai-news`.

- **No raw logs** are sent to Claude. Every call builds a `DashboardContext` object via `buildDashboardContext()` in `/lib/analytics.ts`—summaries only (spend, ROI, by-team, by-tool, anomalies, top spenders).
- **Structured JSON** from `/api/analyze` is validated before returning.
- **Query assistant** includes the last 6 messages (300 chars each) for short-term memory; no server-side chat persistence.
- **Token budget** stays ~1,500–2,100 input tokens per query call.
- **Fallback paths**: deterministic insights when the API key is missing or Claude fails.

### 3. How is the architecture prepared for multi-tenant production?

The prototype simulates a single org ("Acme Corp") but the data model is hierarchical: **org → teams → users → usage logs**.

- **Vendor adapter layer** (`/lib/adapters/`) normalizes each vendor's raw format into a single `UsageLog` type; only adapters see raw data.
- **Analytics layer** (`/lib/analytics.ts`) is the single source of truth for all metrics—components receive pre-computed values.
- **Integrations page** models connectors (status, last sync, data type) ready for real API keys and sync jobs.
- **i18n + RTL** (EN/HE) and **dark/light** themes are built in from the start for global enterprise rollout.

### 4. What would you prioritize next for production?

1. **Real connectors** — Replace mock JSON with scheduled syncs from OpenAI, Anthropic, Copilot, Cursor APIs via the existing adapter pattern.
2. **Auth & multi-tenancy** — Workspace isolation, RBAC (admin vs viewer), SSO.
3. **Persistent storage** — PostgreSQL or warehouse for logs; cache `DashboardContext` server-side.
4. **Alerting** — Budget thresholds, anomaly webhooks, Slack/email digests.
5. **Governance** — Policy rules (model tier caps per team), approval workflows for seat purchases.

---

## 3-Minute Demo Flow Script

| Time | Section | What to show | Key talking point |
|------|---------|--------------|-------------------|
| 0:00–0:30 | **Overview** | KPI grid + ROI by Team chart | "At a glance: $ spend, ROI, waste signals. Engineering leads ROI; Marketing lags." |
| 0:30–0:55 | **Cost Analytics** | Filter by team/tool/month | "Drill into Marketing overspend on Claude Opus for low-complexity tasks." |
| 0:55–1:15 | **ROI & Efficiency** | Model fit table | "38% of calls use overpowered models—immediate savings opportunity." |
| 1:15–1:35 | **AI Insights** | Executive summary + insight cards | "Claude analyzed pre-aggregated metrics—no raw logs left the org." |
| 1:35–1:55 | **Optimization Center** | Recommendations with savings | "$X/month recoverable from seat reduction and model switches." |
| 1:55–2:20 | **Query Assistant** | Ask: "Which team overspent?" or "Where can we cut costs safely?" | "Natural language on the same DashboardContext—answers cite real numbers." |
| 2:20–2:40 | **Tools Directory** | Open a connected tool drawer | "Compare models and pricing; see live org spend and ROI per tool." |
| 2:40–2:55 | **Integrations** | Connector cards | "Eight vendors—seven connected; architecture ready for real sync." |
| 2:55–3:00 | **Polish** | Toggle dark mode + Hebrew (RTL) | "Enterprise-ready: accessible, localized, theme-aware." |

### Demo data highlights (intentional drama)

- Engineering overspends on Claude Opus for low-complexity work
- 12 inactive Cursor seats; Slack AI at ~23% utilization
- Customer Success: highest ROI despite lowest spend
- Cost spike anomaly in week 3 of last month (3× baseline)

### Environment note

Set `ANTHROPIC_API_KEY` in Vercel/host env for live AI Insights, Query, and News. Without it, deterministic fallbacks still demo the full UX.

---

## Deploy to Vercel

The project includes `vercel.json` and builds successfully with `npm run build`.

```bash
npx vercel login
npx vercel --prod
```

In the Vercel dashboard, add environment variable:

- `ANTHROPIC_API_KEY` — required for live Claude routes (optional for demo; fallbacks apply)

Connect the GitHub repo for automatic deploys on push to `main`.
