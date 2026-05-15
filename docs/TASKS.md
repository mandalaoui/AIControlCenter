# TASKS — AIControlCenter Build Plan

## Phase 1 — Foundation
- [x] Init Next.js 15 app with TypeScript, Tailwind, App Router
- [x] Install and configure shadcn/ui
- [x] Install recharts, i18next, next-themes
- [x] Set up folder structure:
      /app /components /lib /data /public /locales /docs/design
- [x] Configure dark/light theme provider
- [x] Configure i18next with EN/HE + RTL support
- [x] Build base Layout: sidebar + navbar + main content area
- [x] Build `<DashboardCard>` reusable wrapper component

## Phase 2 — Data & Analytics
- [x] Create `/data/mock_logs.json` — 150+ records, dramatic data
- [x] Create `/data/mock_metrics.json` — pre-aggregated summary
- [x] Create `/data/tools-directory.ts` — static tool/model definitions
      (OpenAI, Anthropic, Google, GitHub Copilot, Cursor, Microsoft, Slack AI)
- [x] Build `/lib/analytics.ts`:
      - [x] calculateROI()
      - [x] calculateCPT()
      - [x] calculateEfficiencyScore()
      - [x] calculateWasteRatio()
      - [x] detectAnomalies()
      - [x] getTeamSummaries()
      - [x] getToolSummaries()
      - [x] getModelFitAnalysis()
      - [x] getOptimizationRecommendations()
      - [x] buildDashboardContext()     ← summary object for Claude
- [x] Build `/lib/tools.ts`:
      - [x] getToolSpend(toolId, analyticsData)
      - [x] getToolROI(toolId, analyticsData)
      - [x] getToolSeatUtilization(toolId, analyticsData)
      - [x] enrichToolsWithOrgData(tools, analyticsData)

## Phase 3 — Overview Page
- [x] KPI cards grid (8 cards):
      Total Spend, ROI, Cost Savings Opportunity, Hours Saved,
      CPT, Efficiency Score, Active Users, Underused Seats
- [x] Each card: value + trend + sparkline + AI insight box
- [x] ROI by Team bar chart (with 100% reference line)
- [x] ROI by Tool horizontal bar chart
- [x] Spend by Provider pie chart (with center total label)
- [x] Spend Over Time line chart (dots on lines, multi-provider)

## Phase 4 — Secondary Dashboard Pages
- [x] Cost Analytics — breakdown by team/tool/month, filter controls
- [x] ROI & Efficiency — deep metrics, model fit analysis table
- [x] Teams — per-team cards with drill-down stats
- [x] Tools & Models — tool comparison table + model usage breakdown
- [x] Smart Usage Logs — paginated table, AI category columns,
      alternating rows, impact badges

## Phase 5 — AI Integration
- [x] Build `/app/api/analyze/route.ts`:
      - Input: DashboardContext (from buildDashboardContext())
      - Output: { insights[], recommendations[], executiveSummary }
      - Model: claude-sonnet-4-20250514
      - Structured JSON output, validated before returning
- [x] Build `/app/api/query/route.ts`:
      - Input: { question: string, history: Message[] }
      - Output: { answer: string }
      - Conversation history: last 6 messages, 300 char truncation
      - System prompt includes full DashboardContext
- [x] AI Insights page — renders insights[] from /api/analyze
- [x] Optimization Center — renders recommendations[] from /api/analyze
- [x] Query Assistant UI:
      - [x] Suggested prompt chips
      - [x] Chat message list
      - [x] Input + send
      - [x] Loading state
      - [x] Error state
      - [x] Conversation history in component state

## Phase 6 — AI Tools Directory
- [x] `/app/tools-directory/page.tsx` — main directory page
- [x] Filter/search bar (by category, provider, connected status)
- [x] Tool cards grid:
      - Tool name + provider + category badge
      - Description
      - Strengths (top 3, green tags)
      - Best for (UsageType chips)
      - Pricing plans summary
      - "Connected" badge if in org
      - If connected: live spend + ROI from org data
- [x] Tool detail panel / drawer (click to expand):
      - Full description + strengths + limitations
      - Model comparison table:
        | Model | Context | Input $/1M | Output $/1M | Speed | Recommended |
      - All pricing plans detail
      - Recommended use cases
      - Anti-patterns (when NOT to use)
      - If connected: org usage stats inline
- [x] `/app/api/ai-news/route.ts` — Claude + web_search news fetch
- [x] News Feed page `/app/ai-news/page.tsx`:
      - [x] Filter tabs: All | New Models | Pricing | New Tools | Industry
      - [x] NewsItem cards: title, summary, source badge, category, link
      - [x] Last updated timestamp + Refresh button
      - [x] 1-hour in-memory cache
      - [x] Fallback: show cached data on fetch error

## Phase 7 — Integrations & Settings
- [x] Integrations page — connector cards (simulated)
      Status, last sync, data type, Configure button
- [x] Settings page — org name, theme, language, API key input (UI only)

## Phase 8 — Polish & Delivery
- [x] Verify dark/light mode on all pages
- [x] Verify RTL layout in Hebrew mode
- [x] Error states on all AI-powered components
- [x] Loading skeletons on data-heavy sections
- [x] Deploy to Vercel
- [x] Write answers to the 4 preparation questions
- [x] Prepare 3-minute demo flow script

## Current Status
Phase: 8 — Complete

## Notes for Cursor
- Read all /docs/ files before starting any phase
- Read DATA_AND_BUSINESS_LOGIC.md before touching analytics, AI routes, or directory data
- Read UI_UX_GUIDELINES.md before building any component
- One task at a time — complete and verify before moving on
- Never calculate metrics inside components — use /lib/analytics.ts
- Never hardcode colors — Tailwind semantic classes only
- Never pass raw logs to Claude — always use buildDashboardContext()
