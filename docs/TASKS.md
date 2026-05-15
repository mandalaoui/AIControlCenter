# TASKS — AIControlCenter Build Plan

## Phase 1 — Foundation
- [ ] Init Next.js 15 app with TypeScript, Tailwind, App Router
- [ ] Install and configure shadcn/ui
- [ ] Install recharts, i18next, next-themes
- [ ] Set up folder structure:
      /app /components /lib /data /public /locales /docs/design
- [ ] Configure dark/light theme provider
- [ ] Configure i18next with EN/HE + RTL support
- [ ] Build base Layout: sidebar + navbar + main content area
- [ ] Build `<DashboardCard>` reusable wrapper component

## Phase 2 — Data & Analytics
- [ ] Create `/data/mock_logs.json` — 150+ records, dramatic data
- [ ] Create `/data/mock_metrics.json` — pre-aggregated summary
- [ ] Create `/data/tools-directory.ts` — static tool/model definitions
      (OpenAI, Anthropic, Google, GitHub Copilot, Cursor, Microsoft, Slack AI)
- [ ] Build `/lib/analytics.ts`:
      - [ ] calculateROI()
      - [ ] calculateCPT()
      - [ ] calculateEfficiencyScore()
      - [ ] calculateWasteRatio()
      - [ ] detectAnomalies()
      - [ ] getTeamSummaries()
      - [ ] getToolSummaries()
      - [ ] getModelFitAnalysis()
      - [ ] getOptimizationRecommendations()
      - [ ] buildDashboardContext()     ← summary object for Claude
- [ ] Build `/lib/tools.ts`:
      - [ ] getToolSpend(toolId, analyticsData)
      - [ ] getToolROI(toolId, analyticsData)
      - [ ] getToolSeatUtilization(toolId, analyticsData)
      - [ ] enrichToolsWithOrgData(tools, analyticsData)

## Phase 3 — Overview Page
- [ ] KPI cards grid (8 cards):
      Total Spend, ROI, Cost Savings Opportunity, Hours Saved,
      CPT, Efficiency Score, Active Users, Underused Seats
- [ ] Each card: value + trend + sparkline + AI insight box
- [ ] ROI by Team bar chart (with 100% reference line)
- [ ] ROI by Tool horizontal bar chart
- [ ] Spend by Provider pie chart (with center total label)
- [ ] Spend Over Time line chart (dots on lines, multi-provider)

## Phase 4 — Secondary Dashboard Pages
- [ ] Cost Analytics — breakdown by team/tool/month, filter controls
- [ ] ROI & Efficiency — deep metrics, model fit analysis table
- [ ] Teams — per-team cards with drill-down stats
- [ ] Tools & Models — tool comparison table + model usage breakdown
- [ ] Smart Usage Logs — paginated table, AI category columns,
      alternating rows, impact badges

## Phase 5 — AI Integration
- [ ] Build `/app/api/analyze/route.ts`:
      - Input: DashboardContext (from buildDashboardContext())
      - Output: { insights[], recommendations[], executiveSummary }
      - Model: claude-sonnet-4-20250514
      - Structured JSON output, validated before returning
- [ ] Build `/app/api/query/route.ts`:
      - Input: { question: string, history: Message[] }
      - Output: { answer: string }
      - Conversation history: last 6 messages, 300 char truncation
      - System prompt includes full DashboardContext
- [ ] AI Insights page — renders insights[] from /api/analyze
- [ ] Optimization Center — renders recommendations[] from /api/analyze
- [ ] Query Assistant UI:
      - [ ] Suggested prompt chips
      - [ ] Chat message list
      - [ ] Input + send
      - [ ] Loading state
      - [ ] Error state
      - [ ] Conversation history in component state

## Phase 6 — AI Tools Directory
- [ ] `/app/tools-directory/page.tsx` — main directory page
- [ ] Filter/search bar (by category, provider, connected status)
- [ ] Tool cards grid:
      - Tool name + provider + category badge
      - Description
      - Strengths (top 3, green tags)
      - Best for (UsageType chips)
      - Pricing plans summary
      - "Connected" badge if in org
      - If connected: live spend + ROI from org data
- [ ] Tool detail panel / drawer (click to expand):
      - Full description + strengths + limitations
      - Model comparison table:
        | Model | Context | Input $/1M | Output $/1M | Speed | Recommended |
      - All pricing plans detail
      - Recommended use cases
      - Anti-patterns (when NOT to use)
      - If connected: org usage stats inline
- [ ] `/app/api/ai-news/route.ts` — Claude + web_search news fetch
- [ ] News Feed page `/app/ai-news/page.tsx`:
      - [ ] Filter tabs: All | New Models | Pricing | New Tools | Industry
      - [ ] NewsItem cards: title, summary, source badge, category, link
      - [ ] Last updated timestamp + Refresh button
      - [ ] 1-hour in-memory cache
      - [ ] Fallback: show cached data on fetch error

## Phase 7 — Integrations & Settings
- [ ] Integrations page — connector cards (simulated)
      Status, last sync, data type, Configure button
- [ ] Settings page — org name, theme, language, API key input (UI only)

## Phase 8 — Polish & Delivery
- [ ] Verify dark/light mode on all pages
- [ ] Verify RTL layout in Hebrew mode
- [ ] Error states on all AI-powered components
- [ ] Loading skeletons on data-heavy sections
- [ ] Deploy to Vercel
- [ ] Write answers to the 4 preparation questions
- [ ] Prepare 3-minute demo flow script

## Current Status
Phase: 1 — Not started

## Notes for Cursor
- Read all /docs/ files before starting any phase
- Read DATA_AND_BUSINESS_LOGIC.md before touching analytics, AI routes, or directory data
- Read UI_UX_GUIDELINES.md before building any component
- One task at a time — complete and verify before moving on
- Never calculate metrics inside components — use /lib/analytics.ts
- Never hardcode colors — Tailwind semantic classes only
- Never pass raw logs to Claude — always use buildDashboardContext()