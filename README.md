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
- Letting users ask plain-English questions about the data via Claude
- Generating automated AI-powered insights and optimization recommendations

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
│   ├── integrations/             # Static display of connected integrations
│   ├── ai-news/                  # AI industry news feed (calls /api/ai-news)
│   └── settings/                 # Theme, language, org name settings
│
│   └── api/
│       ├── query/route.ts        # POST — NL question → Claude answer
│       ├── analyze/route.ts      # POST — dashboard context → structured insights JSON
│       └── ai-news/route.ts      # GET  — AI news via Claude (cached)
│
├── components/                   # All UI components, organized by feature
│   ├── layout/
│   │   ├── app-shell.tsx         # Sidebar + top-bar wrapper
│   │   ├── sidebar.tsx           # Navigation sidebar
│   │   └── top-bar.tsx           # Header with search, theme toggle, language switch
│   │
│   ├── overview/
│   │   ├── overview-page.tsx     # Overview page layout
│   │   ├── kpi-card.tsx          # Individual KPI metric card
│   │   ├── kpi-grid.tsx          # 4-column KPI grid
│   │   ├── spend-by-provider-chart.tsx   # Pie chart: spend by provider
│   │   ├── spend-over-time-chart.tsx     # Line chart: weekly spend trends
│   │   ├── roi-by-team-chart.tsx         # Bar chart: ROI per team
│   │   ├── roi-by-tool-chart.tsx         # Bar chart: ROI per tool
│   │   └── ai-insight-box.tsx    # Inline AI-written insight under charts
│   │
│   ├── cost-analytics/
│   │   ├── cost-analytics-content.tsx    # Filters + chart + table
│   │   ├── cost-breakdown-chart.tsx      # Bar chart: cost breakdown
│   │   └── cost-breakdown-table.tsx      # Table: cost rows with share %
│   │
│   ├── roi-efficiency/
│   │   ├── roi-metrics-grid.tsx  # Grid of ROI/efficiency metric cards
│   │   └── model-fit-table.tsx   # Table: model mismatch rates
│   │
│   ├── teams/
│   │   ├── teams-grid.tsx        # Grid of team cards
│   │   └── team-card.tsx         # Individual team card
│   │
│   ├── tools-models/
│   │   ├── tool-comparison-table.tsx     # Side-by-side tool metrics
│   │   └── model-usage-table.tsx         # Model usage + mismatch table
│   │
│   ├── tools-directory/
│   │   ├── tools-directory-view.tsx      # Filterable tool catalog
│   │   ├── tool-card.tsx                 # Tool summary card
│   │   ├── tool-detail-sheet.tsx         # Slide-over with full tool details
│   │   ├── tool-model-table.tsx          # Models available per tool
│   │   └── tool-directory-filters.tsx    # Category/search filters
│   │
│   ├── usage-logs/
│   │   ├── usage-logs-table.tsx  # Paginated log table with categorization badges
│   │   └── usage-logs-header.tsx # Header with title
│   │
│   ├── ai-insights/
│   │   ├── ai-insights-content.tsx       # Executive summary + insight cards
│   │   └── insight-card.tsx              # Single AI insight card
│   │
│   ├── optimization/
│   │   ├── optimization-content.tsx      # Total savings banner + recommendation cards
│   │   └── recommendation-card.tsx       # Single recommendation with evidence
│   │
│   ├── query/
│   │   ├── query-assistant.tsx           # Chat UI + send logic
│   │   └── query-message-list.tsx        # Message history rendering
│   │
│   ├── integrations/
│   │   ├── integrations-view.tsx         # Integration connector grid
│   │   ├── integration-card.tsx          # Single connector card
│   │   └── integration-icon.tsx          # Provider icon resolver
│   │
│   ├── ai-news/
│   │   ├── news-feed-view.tsx            # News list with filter tabs
│   │   ├── news-filter-tabs.tsx          # Category tab bar
│   │   └── news-item-card.tsx            # Single news item
│   │
│   ├── ai/
│   │   └── use-analyze.ts        # Hook: fetches /api/analyze, caches result
│   │
│   ├── settings/
│   │   └── settings-form.tsx     # Theme, language, org name, API key (UI only)
│   │
│   ├── shared/                   # Reusable UI primitives
│   │   ├── page-header.tsx       # Section title + optional badge
│   │   ├── page-skeletons.tsx    # Loading skeleton variants
│   │   ├── deferred-content.tsx  # Suspense wrapper with skeleton fallback
│   │   ├── ai-error-state.tsx    # Error display with retry button
│   │   ├── filter-select.tsx     # Dropdown filter component
│   │   └── impact-badge.tsx      # Colored badge (high/medium/low/waste)
│   │
│   ├── dashboard-card.tsx        # Base card wrapper used across the app
│   ├── placeholder-page.tsx      # "Coming soon" placeholder (unused)
│   ├── providers.tsx             # ThemeProvider + I18nProvider
│   └── i18n-provider.tsx         # Language context + switcher
│
├── lib/                          # All business logic and utilities
│   ├── analytics.ts              # Core analytics engine (all metric calculations)
│   ├── overview.ts               # Overview page data assembly
│   ├── types.ts                  # All TypeScript types and interfaces
│   ├── format.ts                 # Currency and number formatters
│   ├── navigation.ts             # Sidebar nav items definition
│   ├── tools.ts                  # Tool directory enrichment with analytics
│   ├── tools-directory-filters.ts # Tool catalog filter logic
│   ├── utils.ts                  # Tailwind class utility (cn)
│   │
│   ├── ai/
│   │   ├── claude-client.ts      # Anthropic API fetch wrapper (query + analyze)
│   │   ├── prompts.ts            # System prompts for query and analyze routes
│   │   ├── constants.ts          # Model name, token limits, history limits
│   │   ├── validate.ts           # JSON extraction and response schema validation
│   │   ├── fallback-analyze.ts   # Rule-based analyze response (no API key)
│   │   ├── fallback-news.ts      # Static news fallback (no API key)
│   │   ├── news-client.ts        # Claude-powered news fetch
│   │   ├── news-cache.ts         # In-memory news cache
│   │   └── news-validate.ts      # News response schema validation
│   │
│   ├── adapters/                       # Data normalization layer (future use)
│   │   ├── anthropic.adapter.ts        # Anthropic API log format → UsageLog
│   │   ├── openai.adapter.ts           # OpenAI API log format → UsageLog
│   │   ├── cursor.adapter.ts           # Cursor log format → UsageLog
│   │   ├── github-copilot.adapter.ts   # GitHub Copilot log format → UsageLog
│   │   ├── shared.ts                   # Shared adapter utilities
│   │   └── index.ts                    # Adapter registry
│   │
│   └── i18n/
│       ├── client.ts             # i18next client-side initialization
│       └── settings.ts           # Supported languages config
│
├── data/                         # Static mock data
│   ├── mock_logs.json            # 620 usage log records (6 months, 6 teams, 8 tools)
│   ├── mock_metrics.json         # Pre-computed metrics snapshot (May 2026)
│   ├── integrations.ts           # Integration connector definitions
│   └── tools-directory.ts        # Full tool catalog with pricing & models
│
├── locales/                      # Translations
│   ├── en/common.json            # English strings
│   └── he/common.json            # Hebrew strings (RTL)
│
├── docs/                         # Internal project documentation
│   ├── PROJECT_CONTEXT.md
│   ├── DATA_AND_BUSINESS_LOGIC.md
│   ├── UI_UX_GUIDELINES.md
│   ├── TASKS.md
│   ├── DEMO_PREP.md
│   └── PHASE8_VERIFICATION.md
│
├── public/                       # Static assets
├── .cursorrules                  # Cursor AI development rules
├── components.json               # shadcn/ui config
├── next.config.ts
├── package.json
├── tailwind.config (via PostCSS)
├── tsconfig.json
└── vercel.json
```

---

## Core Analytics Engine (`lib/analytics.ts`)

All metrics are computed from raw usage logs. No metric is hardcoded.

### Metrics Defined


| Metric                       | Formula                                                   | Purpose                     |
| ---------------------------- | --------------------------------------------------------- | --------------------------- |
| **ROI**                      | `((hoursSaved × $75 − cost) / cost) × 100`                | Primary value indicator     |
| **Efficiency Score**         | `ROI×40% + successRate×30% + modelFit×20% + seatUtil×10%` | Composite 0–100 score       |
| **Cost per Task (CPT)**      | `cost / successfulTasks`                                  | Cost efficiency             |
| **Waste Ratio**              | `costOfLowROILogs / totalCost`                            | Spend on unproductive usage |
| **Model Mismatch Rate**      | `(Opus/GPT-4 calls with complexityScore < 4) / total`     | Routing efficiency          |
| **Seat Utilization**         | `activeSeats / totalSeats`                                | License efficiency          |
| **Cost Savings Opportunity** | `unusedSeats × monthlySeatCost`                           | Actionable savings estimate |


### Anomaly Detection

Automatic flags for:

- Weekly team spend ≥ 2.5× baseline (spend spike)
- Seat utilization < 30% on seat-based tools
- Team ROI below 100%
- Claude Opus mismatch rate > 30%

### Smart Categorization

Each log entry is automatically tagged with:

- **productivityLevel**: `high` / `medium` / `low`
- **impactLevel**: `high-impact` / `medium-impact` / `high-cost` / `waste`

---

## AI Features

### 1. Natural Language Query (`/query`)

Users type questions in plain English. The system sends the full computed dashboard context to Claude with a structured system prompt.

**Examples that work:**

- *"Which team overspent this month?"*
- *"Where is the lowest ROI?"*
- *"Where can we cut costs?"*
- *"Any anomalies this week?"*

**Fallback behavior:** If no API key is configured, a deterministic JS function answers the same set of questions from the computed data directly. The chat UI works in both cases.

**Conversation history:** Last 6 messages (up to 300 chars each) are included for context.

### 2. AI Insights (`/ai-insights`)

Sends the full `DashboardContext` JSON to Claude and receives structured JSON back:

```json
{
  "insights": [{ "type", "severity", "title", "description", "confidence", "recommendedAction" }],
  "recommendations": [{ "category", "estimatedMonthlySavings", "riskLevel", "evidence" }],
  "executiveSummary": "2-3 sentence summary"
}
```

Output is validated against schema before rendering.

**Fallback behavior:** Rule-based response derived from anomaly detection — renders real data, not placeholder text.

### 3. Optimization Recommendations (`/optimization`)

Uses the same `/api/analyze` call. Renders the `recommendations` array as actionable cards with estimated savings, risk level, and evidence.

### 4. AI News (`/ai-news`)

Claude generates a curated list of recent AI industry news items in JSON format. Result is cached in memory per server instance.

> ⚠️ This feature is outside the scope of the assignment. It has no connection to usage data and serves no analytical purpose for the dashboard.

---

## Known Limitations

### API Key Is Not Connected to Settings UI

The Settings page has an "Anthropic API Key" input field. This key is saved to `localStorage` only. It is **not** forwarded to the server — the API routes read exclusively from `process.env.ANTHROPIC_API_KEY`.

**Effect:** Entering a key in Settings has no effect on AI features. Both the Query assistant and AI Insights will use the fallback (rule-based) responses unless `ANTHROPIC_API_KEY` is set as a Vercel environment variable.

**Fix:** Add an `x-api-key` header to client-side fetch calls to `/api/query` and `/api/analyze`, and read it server-side via `request.headers.get('x-api-key')` as a fallback to `process.env`.

### Data Is Fully Static

All data comes from `mock_logs.json` (620 records, hardcoded import). There is no file upload, no URL parameter, and no way for a user to load their own data.

The `lib/adapters/` folder contains normalization adapters for Anthropic, OpenAI, and Cursor log formats — but these are not connected to any ingestion path.

### Integrations Page Is Decorative

The `/integrations` page shows a grid of "connected" integration cards (OpenAI, Anthropic, GitHub, Cursor, etc.) with status badges and sync timestamps. None of these fetch real data. All values are hardcoded in `data/integrations.ts`.

### AI News Is Irrelevant to the Assignment

`/ai-news` calls Claude to generate a news feed about the AI industry. It has no relation to the organization's usage data and was not required by the assignment.

---

## Stack


| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Framework  | Next.js 15 (App Router)                      |
| Language   | TypeScript (strict)                          |
| Styling    | Tailwind CSS v4 + shadcn/ui (New York style) |
| Charts     | Recharts                                     |
| AI         | Anthropic Claude claude-sonnet-4-20250514    |
| i18n       | i18next + react-i18next                      |
| Theming    | next-themes (dark / light / system)          |
| Deployment | Vercel                                       |


---

## Running Locally

```bash
# Install dependencies
npm install

# Set environment variable
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local

# Start dev server
npm run dev
```

App runs at `http://localhost:3000`.

Without `ANTHROPIC_API_KEY`, all AI features fall back to rule-based responses. The dashboard, charts, and all data views work fully without a key.

---

## Data Schema

Each record in `mock_logs.json`:

```ts
{
  id: string;
  date: string;               // ISO 8601
  team: Team;                 // Engineering | Product | Marketing | Sales | Operations | Customer Success
  user: string;               // Name
  tool: Tool;                 // OpenAI API | Anthropic API | Cursor | GitHub Copilot | ...
  model: Model;               // GPT-4 | Claude Opus | Gemini Pro | ...
  platform: string;
  usageType: UsageType;       // coding | research | content | support | automation | analysis
  inputTokens: number;
  outputTokens: number;
  requests: number;
  cost: number;               // USD
  estimatedHoursSaved: number;
  successfulTasks: number;
  totalTasks: number;
  complexityScore: number;    // 1–10
}
```

620 records spanning 6 months, 6 teams, 24 users, 8 tools, 9 models.

---

## Pages Reference


| Route              | Status                             | Description                                      |
| ------------------ | ---------------------------------- | ------------------------------------------------ |
| `/`                | ✅ Full                             | Executive overview: KPIs, 4 charts               |
| `/cost-analytics`  | ✅ Full                             | Cost breakdown with filters (team/tool/month)    |
| `/roi-efficiency`  | ✅ Full                             | ROI metrics grid + model fit analysis table      |
| `/teams`           | ✅ Full                             | Per-team cards with all metrics                  |
| `/tools-models`    | ✅ Full                             | Tool comparison table + model usage table        |
| `/tools-directory` | ✅ Full                             | Filterable tool catalog with detail sheets       |
| `/usage-logs`      | ✅ Full                             | Paginated categorized log table                  |
| `/ai-insights`     | ✅ Full (needs API key for real AI) | Insight cards + executive summary                |
| `/optimization`    | ✅ Full (needs API key for real AI) | Recommendation cards with savings estimates      |
| `/query`           | ✅ Full (needs API key for real AI) | Chat interface for NL data queries               |
| `/integrations`    | ⚠️ Decorative                      | Static display, no real data                     |
| `/ai-news`         | ⚠️ Off-scope                       | AI news feed, unrelated to usage data            |
| `/settings`        | ⚠️ Partial                         | Theme/language work; API key field has no effect |


