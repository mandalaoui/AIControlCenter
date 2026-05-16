# AIControlCenter

**AI Cost & Usage Intelligence Dashboard**

A working prototype of an enterprise dashboard that provides unified visibility into AI tool usage, costs, and ROI across teams — with an LLM-powered natural language query interface and automated insight generation.

🔗 **Live Demo:** [ai-control-center-omer.vercel.app](https://ai-control-center-omer.vercel.app)

---

## What This Project Does

Organizations that use multiple AI tools (OpenAI API, Cursor, GitHub Copilot, Claude, etc.) have no single place to understand what they're spending, which tools are delivering value, and where money is being wasted.

AIControlCenter solves that by:

- Aggregating usage data across 8 AI tools and 9 models
- Computing ROI, efficiency scores, and waste ratios per team and tool
- Detecting anomalies (spend spikes, underused seats, model mismatches)
- Letting users ask plain-English questions about the data via Llama 4 Scout (Groq)
- Generating automated AI-powered insights and optimization recommendations

---

## Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Framework  | Next.js 15 (App Router)                       |
| Language   | TypeScript (strict)                           |
| Styling    | Tailwind CSS v4 + shadcn/ui (New York style)  |
| Charts     | Recharts                                      |
| AI         | Groq (`meta-llama/llama-4-scout-17b-16e-instruct`) |
| i18n       | i18next + react-i18next                       |
| Theming    | next-themes (dark / light / system)           |
| Deployment | Vercel                                        |

---

## Running Locally

```bash
# Install dependencies
npm install

# Set environment variable
echo "GROQ_API_KEY=gsk_..." > .env.local

# Start dev server
npm run dev
```

App runs at `http://localhost:3000`.

Without `GROQ_API_KEY`, all AI features fall back to deterministic rule-based responses. The dashboard, charts, and all data views work fully without a key.

---

## Pages Reference

| Route              | Status                              | Description                                   |
| ------------------ | ----------------------------------- | --------------------------------------------- |
| `/`                | ✅ Full                              | Executive overview: KPIs, 4 charts            |
| `/cost-analytics`  | ✅ Full                              | Cost breakdown with filters (team/tool/month) |
| `/roi-efficiency`  | ✅ Full                              | ROI metrics grid + model fit analysis table   |
| `/teams`           | ✅ Full                              | Per-team cards with all metrics               |
| `/tools-models`    | ✅ Full                              | Tool comparison table + model usage table     |
| `/tools-directory` | ✅ Full                              | Filterable tool catalog with detail sheets    |
| `/usage-logs`      | ✅ Full                              | Paginated categorized log table               |
| `/ai-insights`     | ✅ Full (needs API key for real AI)  | Insight cards + executive summary             |
| `/optimization`    | ✅ Full (needs API key for real AI)  | Recommendation cards with savings estimates   |
| `/query`           | ✅ Full (needs API key for real AI)  | Chat interface for NL data queries            |
| `/integrations`    | ✅ Full, from data                      | Structured from tools-directory data          |
| `/ai-news`         | Off-scope                           | AI news feed, unrelated to usage data         |
| `/settings`        | Partial                             | Theme/language work; API key field no effect  |

---

## Core Analytics Engine (`lib/analytics.ts`)

All metrics are computed from raw usage logs. No metric is hardcoded.

### Metrics

| Metric                        | Formula                                                    | Purpose                      |
| ----------------------------- | ---------------------------------------------------------- | ---------------------------- |
| **ROI**                       | `((hoursSaved × $75 − cost) / cost) × 100`                 | Primary value indicator      |
| **Efficiency Score**          | `ROI×40% + successRate×30% + modelFit×20% + seatUtil×10%` | Composite 0–100 score        |
| **Cost per Task (CPT)**       | `cost / successfulTasks`                                   | Cost efficiency              |
| **Waste Ratio**               | `costOfLowROILogs / totalCost`                             | Spend on unproductive usage  |
| **Model Mismatch Rate**       | `(Opus/GPT-4 calls with complexityScore < 4) / total`      | Routing efficiency           |
| **Seat Utilization**          | `activeSeats / totalSeats`                                 | License efficiency           |
| **Cost Savings Opportunity**  | `unusedSeats × monthlySeatCost`                            | Actionable savings estimate  |

### Anomaly Detection

Automatic flags for:

- Weekly team spend ≥ 2.5× baseline (spend spike)
- Seat utilization < 30% on seat-based tools
- Team ROI below 100%
- Claude Opus or GPT-4 mismatch rate > 30%

### Smart Categorization

Each log entry is automatically tagged with:

- **productivityLevel**: `high` / `medium` / `low`
- **impactLevel**: `high-impact` / `medium-impact` / `high-cost` / `waste`

---

## AI Features

### 1. Natural Language Query (`/query`)

Users type questions in plain English. The system serializes the full computed `DashboardContext` and sends it to Llama 4 Scout via Groq with a structured system prompt.

**Examples:**

- *"Which team overspent this month?"*
- *"Where is the lowest ROI?"*
- *"Where can we cut costs?"*
- *"Any anomalies this week?"*

Conversation history: last 6 messages (up to 300 chars each) are included for context continuity.

**Fallback:** If no API key is configured, a deterministic JS function answers the same questions directly from computed data. The chat UI works in both modes.

### 2. AI Insights (`/ai-insights`)

Sends the full `DashboardContext` JSON to Llama 4 Scout via Groq and receives structured JSON back:

```json
{
  "insights": [
    {
      "id": "engineering_premium_model_concentration",
      "type": "anomaly",
      "severity": "warning",
      "category": "financial",
      "priority": "high",
      "title": "Engineering over-indexed on premium models",
      "description": "...",
      "whyThisMatters": "...",
      "recommendedAction": "...",
      "affectedEntity": "Engineering",
      "confidence": 0.87,
      "estimatedSavings": 1200
    }
  ],
  "executiveSummary": "2-3 sentence board-ready summary"
}
```

Output is validated against a strict schema before rendering. The prompt instructs the model to produce 2–8 insights, prefer quality over quantity, and never fabricate metrics or use placeholder syntax.

**Fallback:** Rule-based response derived from anomaly detection — renders real data, not stub text.

### 3. Optimization Recommendations (`/optimization`)

Distinct from AI Insights in its source and nature. Recommendations are computed **deterministically** from the analytics engine — model mismatch detection, seat overlap analysis, and tool redundancy scoring — and presented as actionable cards with estimated monthly savings, risk level, and supporting evidence. No LLM call is involved; the data drives the output directly.

AI Insights (above) uses the LLM to synthesize patterns and produce open-ended strategic observations. Optimization surfaces concrete, rule-based actions the organization can take immediately.

### 4. AI News (`/ai-news`)

Llama 4 Scout generates a curated list of AI industry news items in JSON format. Result is cached per server instance.

> This feature goes beyond the assignment scope. Because no live news API is connected, the content is fictitious — the model generates plausible-sounding but fabricated news items. It demonstrates the AI integration pattern but should not be treated as real information.

---

## More Features

### Tools Directory (`/tools-directory`)

A browsable, filterable catalog of AI tools available on the market — not just the ones tracked in the usage data. Each entry includes pricing model, supported models, use case categories, and a detail slide-over with a full breakdown.

This functions as an internal marketplace: teams can discover tools, compare pricing structures (per-token, per-seat, subscription), and understand which models each tool exposes before requesting access. Entries are enriched with live utilization data where the tool is already in use by the organization.

---

## Data Schema

Each record in `data/generated/usage-logs.generated.json`:

```ts
{
  id: string;
  date: string;                // ISO 8601
  team: Team;                  // Engineering | Product | Marketing | Sales | Operations | Customer Success
  user: string;
  tool: Tool;                  // OpenAI API | Anthropic API | Cursor | GitHub Copilot | ...
  model: Model;                // GPT-4 | Claude Opus | Gemini Pro | ...
  platform: string;
  usageType: UsageType;        // coding | research | content | support | automation | analysis
  inputTokens: number;
  outputTokens: number;
  requests: number;
  cost: number;                // USD
  estimatedHoursSaved: number;
  successfulTasks: number;
  totalTasks: number;
  complexityScore: number;     // 1–10
}
```

620 records spanning 6 months, 6 teams, 24 users, 8 tools, 9 models. Raw provider data lives in `data/raw/` and is normalized via `scripts/expand-raw-telemetry.ts`.

---

## File & Folder Structure

```
AIControlCenter/
│
├── app/                          # Next.js 15 App Router — pages & API routes
│   ├── page.tsx                  # Overview dashboard (KPIs + charts)
│   ├── layout.tsx                # Root layout, theme & i18n providers
│   ├── globals.css               # Global styles, CSS variables
│   │
│   ├── cost-analytics/           # Cost breakdown by team / tool / month
│   ├── roi-efficiency/           # ROI metrics + model fit analysis
│   ├── teams/                    # Per-team cards with detailed metrics
│   ├── tools-models/             # Tool comparison + model usage tables
│   ├── tools-directory/          # Browsable catalog of AI tools with pricing
│   ├── usage-logs/               # Paginated categorized usage log table
│   ├── ai-insights/              # AI-generated insights (calls /api/analyze)
│   ├── optimization/             # Optimization recommendations (calls /api/analyze)
│   ├── query/                    # Natural language query assistant (calls /api/query)
│   ├── integrations/             # Connected integrations
│   ├── ai-news/                  # AI industry news feed (calls /api/ai-news)
│   └── settings/                 # Theme, language, org name settings
│
│   └── api/
│       ├── query/route.ts        # POST — NL question → Claude answer
│       ├── analyze/route.ts      # POST — dashboard context → structured insights JSON
│       └── ai-news/route.ts      # GET  — AI news via Claude (cached)
│
├── components/                   # All UI components, organized by feature
│   ├── layout/                   # Sidebar, top-bar, app shell
│   ├── overview/                 # KPI cards, spend charts, ROI charts
│   ├── cost-analytics/           # Filters, breakdown chart, breakdown table
│   ├── roi-efficiency/           # ROI metrics grid, model fit table
│   ├── teams/                    # Team cards grid
│   ├── tools-models/             # Tool comparison table, model usage table
│   ├── tools-directory/          # Filterable catalog, detail slide-over
│   ├── usage-logs/               # Paginated log table with categorization badges
│   ├── ai-insights/              # Insight cards, executive summary
│   ├── optimization/             # Recommendation cards with savings
│   ├── query/                    # Chat UI, message list
│   ├── integrations/             # Integration connector grid
│   ├── ai-news/                  # News feed, filter tabs, news cards
│   └── shared/                   # Page headers, skeletons, error states, badges
│
├── lib/                          # All business logic and utilities
│   ├── analytics.ts              # Core analytics engine (all metric calculations)
│   ├── analytics/
│   │   ├── math.ts               # ROI, CPT, rounding helpers
│   │   ├── constants.ts          # Hourly rate, thresholds, model lists
│   │   ├── confidence.ts         # Recommendation confidence scoring
│   │   ├── model-mismatch.ts     # Model mismatch detection + recommendations
│   │   └── overlap.ts            # Tool overlap / redundancy detection
│   ├── ai/
│   │   ├── clients/llm-client.ts # LLM fetch wrapper (Groq via AI SDK)
│   │   ├── prompts.ts            # System prompts for query and analyze routes
│   │   ├── schemas.ts            # Zod schemas for AI response validation
│   │   ├── fallback-analyze.ts   # Rule-based analyze response (no API key)
│   │   └── fallback-news.ts      # Static news fallback (no API key)
│   ├── ai-insights/              # Insight enrichment pipeline
│   │   ├── synthesis.ts          # Multi-signal insight synthesis
│   │   ├── quality-filter.ts     # Insight quality gating
│   │   ├── strategic-risks.ts    # Risk insight generators
│   │   └── ...                   # Additional insight modules
│   ├── pricing/
│   │   ├── pricing-map.ts        # Input/output cost per model ($/1K tokens)
│   │   └── calculate-cost.ts     # Token-based cost calculation
│   ├── i18n/                     # i18next client/server setup, label translation
│   ├── types.ts                  # All TypeScript types and interfaces
│   ├── format.ts                 # Currency and number formatters
│   └── tool-registry.ts          # Seat-based tool definitions and costs
│
├── data/
│   ├── raw/                      # Raw provider-format logs (JSON)
│   │   ├── openai.raw.json
│   │   ├── anthropic.raw.json
│   │   ├── cursor.raw.json
│   │   └── github-copilot.raw.json
│   ├── generated/                # Normalized output (produced by scripts)
│   │   ├── usage-logs.generated.json
│   │   └── metrics.generated.json
│   └── tools-directory.ts        # Full tool catalog with pricing and models
│
├── scripts/
│   ├── expand-raw-telemetry.ts   # Normalize raw provider logs → UsageLog[]
│   ├── generate-telemetry.ts     # Entry point: write usage-logs.generated.json
│   └── generate-metrics.ts       # Pre-compute metrics snapshot
│
├── locales/
│   ├── en/common.json            # English strings
│   └── he/common.json            # Hebrew strings (RTL)
│
├── next.config.ts
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## Known Limitations

### API Key Is Not Wired to the Settings UI

The Settings page has a "Groq API Key" input that saves to `localStorage` only. It is not forwarded to the server — API routes read exclusively from `process.env.GROQ_API_KEY`.

**Effect:** Entering a key in Settings has no effect. Both the Query assistant and AI Insights use fallback responses unless the key is set as a Vercel environment variable.

**Fix:** Forward the key via an `x-api-key` request header and read it server-side as a fallback to `process.env`.

### Data Is Fully Static

All data comes from `usage-logs.generated.json` (hardcoded import). There is no file upload, URL parameter, or runtime ingestion path.

The `lib/` folder contains normalization adapters for Anthropic, OpenAI, Cursor, and GitHub Copilot log formats — but these are not connected to any live ingestion pipeline.

---

## Preparation Questions

### 1. Which metrics did you choose, and why?

**ROI** (`((hoursSaved × $75 − cost) / cost) × 100`) is the primary metric because it directly answers whether the money spent on AI is returning value — not just whether it's being used. A team with high usage and low ROI is a bigger problem than a team with low usage.

**Efficiency Score** is a composite metric (ROI 40%, task success rate 30%, model fit 20%, seat utilization 10%) designed to capture overall health in a single number. This is useful for executives who want one number per team, not a spreadsheet.

**Model Mismatch Rate** flags cases where high-cost models (GPT-4, Claude Opus) are used on tasks with a complexity score below 4. This is often the most actionable waste signal — the fix is a configuration change, not a workflow change.

**Seat Utilization** catches subscription waste on per-seat tools (Copilot, Cursor). Unused seats are pure cost with zero ROI.

### 2. Which AI feature did you build, and what problem does it solve?

Two primary AI features:

**Natural Language Query** solves the "I have a question about the data but I don't know where to click" problem. Instead of navigating through multiple pages to find which team overspent, a user can just ask. The full `DashboardContext` is serialized and sent as context, so the model has all the numbers it needs to answer accurately. A deterministic fallback ensures the feature degrades gracefully without an API key.

**Automated Insight Generation** solves the "I see the numbers but I don't know what to do with them" problem. The model is prompted to produce 2–8 structured insights with a severity, a business implication, and a recommended action — not just a summary of what the numbers are. The prompt explicitly prohibits placeholder text and requires all values to come directly from the data.

### 3. What would you do differently with another week of work?

- Wire the Settings API key to the server so the live LLM works without a Vercel environment variable.
- Integrate a database backend so the dashboard can load and persist real organizational data instead of relying solely on mock data.
- Add date range filtering across all pages — currently the time period is fixed to the dataset window.
- Add per-user drill-down — the data has user-level granularity but the UI only exposes team-level summaries.
- Connect the AI News feed to Gmail so that each new article triggers an automated email digest containing the article summary alongside AI-generated insights relevant to the organization's current tool usage and spend patterns.

### 4. How would you obtain real data and scale this in a production environment?

**1. Data Ingestion:** To capture real telemetry, we will integrate directly with enterprise AI providers and internal systems using APIs, webhooks, and scheduled syncs.  
**Sources:** OpenAI, Anthropic, GitHub Copilot/Cursor (usage, billing, seat activity), Slack AI, and productivity platforms like Jira, GitHub, and Notion.  
**Metrics:** Model usage, token consumption, spend, active users, and productivity signals will be normalized to a unified schema using configurable adapters.

*The normalization layer already exists in `lib/`—provider-specific adapters for OpenAI, Anthropic, Cursor, and GitHub Copilot that transform raw API responses into the unified `UsageLog` schema. In production, these adapters would be invoked by the ingestion workers rather than operating on static files.*

**2. Scalable Architecture:**  
Raw logs are never sent to the LLM; all data flows asynchronously through an ingestion pipeline that aggregates metrics, computes ROI, flags anomalies, and detects cost drift. This analytics layer is the deterministic source of truth.
**Production Data Flow:**  
Provider APIs ⟶ Ingestion Workers ⟶ Analytics Pipeline ⟶ Aggregated Storage ⟶ LLM Synthesis ⟶ Dashboard

**3. Lightweight LLM Layer & Cost Control:**  
The LLM layer is strictly for strategic synthesis—executive summaries, narrative insights, and action recommendations. No metrics or business logic are calculated within the LLM. Insights are cached and only regenerated periodically, on major telemetry changes, or on demand. This approach dramatically controls API costs and maintains explainability.

**4. Enterprise-Grade Scaling:**  
The production infrastructure includes multi-tenant isolation, robust permissions, audit logging, encrypted secrets management, rate limiting, usage quotas, and a provider abstraction layer to shield application logic from vendor API changes.

**The Vision:**  
This architecture transforms the product from a static dashboard into an AI Operations Intelligence Platform—deterministic, scalable, and explainable. All key metrics are computed from deterministic data; AI powers only the interpretation and narrative, never the underlying numbers.