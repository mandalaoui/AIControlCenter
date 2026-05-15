# Data & Business Logic

## Core Data Model

### UsageLog (primary entity)

```typescript
interface UsageLog {
  id: string
  date: string
  team: Team
  user: string
  tool: Tool
  model: Model
  platform: string
  usageType: UsageType
  inputTokens: number
  outputTokens: number
  requests: number
  cost: number
  estimatedHoursSaved: number
  successfulTasks: number
  totalTasks: number
  complexityScore: number // 1-10
}
type Team =
  | "Engineering" | "Product" | "Marketing"
  | "Sales" | "Operations" | "Customer Success"
type Tool =
  | "OpenAI API" | "Anthropic API" | "GitHub Copilot"
  | "Cursor" | "Microsoft Copilot" | "Slack AI"
  | "Google Gemini" | "Internal Agent"
type Model =
  | "GPT-4" | "GPT-4o" | "GPT-4o-mini" | "GPT-3.5"
  | "Claude Opus" | "Claude Sonnet" | "Claude Haiku"
  | "Gemini Pro" | "Gemini Ultra" | "N/A"
type UsageType =
  | "coding" | "research" | "content"
  | "support" | "automation" | "analysis"
```

## Metrics Definitions

### 1. Cost per Successful Task (CPT)

`CPT = total_cost / successful_tasks`

- Lower = better. Flag logs where CPT > 2x team average.

### 2. ROI

```js
hourly_rate = 75
ROI = ((estimatedHoursSaved * hourly_rate) - cost) / cost * 100
```
- Negative ROI = waste signal.

### 3. AI Efficiency Score (0-100)
- ROI normalized (40%)
- task success rate (30%)
- model fit (20%)
- seat utilization (10%)

### 4. Waste Ratio

`waste_ratio = cost of low-ROI logs (<50% ROI) / total_cost`

### 5. Model Fit Score

high_complexity_models = ["Claude Opus", "GPT-4", "Gemini Ultra"]
mid_complexity_models  = ["Claude Sonnet", "GPT-4o", "Gemini Pro"]
low_complexity_models  = ["Claude Haiku", "GPT-4o-mini", "GPT-3.5"]
mismatch = using high_complexity_model where complexityScore < 4


## AI Categorization (per log)
```typescript
interface AICategorizationResult {
  category: UsageType
  productivityLevel: "high" | "medium" | "low"
  impactLevel: "high-impact" | "medium-impact" | "high-cost" | "waste"
  confidence: number  // 0-1
}
```

## AI Insights Schema
```typescript
interface AIInsight {
  id: string
  type: "anomaly" | "trend" | "recommendation" | "risk"
  severity: "info" | "warning" | "critical"
  title: string
  description: string
  affectedEntity: string
  estimatedSavings?: number
  confidence: number
  recommendedAction: string
}
```

## Optimization Recommendation Schema
```typescript
interface OptimizationRecommendation {
  id: string
  title: string
  description: string
  evidence: string
  riskLevel: "low" | "medium" | "high"
  confidence: number
  estimatedMonthlySavings: number
  category: "model-switch" | "seat-reduction" | "workflow" | "tool-consolidation"
}
```

## Mock Data Requirements
- 150+ usage logs across 6 months
- Intentionally dramatic data:
  - Engineering overspends on Claude Opus for low-complexity tasks
  - 12 inactive Cursor seats
  - Marketing has lowest ROI (high spend, low hours saved)
  - Slack AI has 23% seat utilization
  - One anomaly: cost spike in week 3 of last month (3x normal)
  - Customer Success has highest ROI despite lowest spend
- Data must support all metric calculations without edge cases

## Analytics Layer Rules
- ALL calculations happen in `/lib/analytics.ts`
- Components receive pre-computed values only — never calculate in JSX
- All monetary values rounded to 2 decimal places
- All percentages rounded to 1 decimal place
- ROI capped at display of 999% (show "999%+" above that)


## AI Query Layer

### Architecture Overview

The AI Query Layer powers natural language analytics for the dashboard, offering two main API routes — ad hoc Q&A and proactive insight generation. All calculations are performed prior to passing data to the AI: **raw logs are never sent**. The architecture emphasizes deterministic, explainable answers, low token count, and stateless operation (no persistent chat history).

- **No agent "planner/executor" pattern:** Each user question is resolved in a single step by assembling a context summary, prepending truncated conversation history, and invoking Claude Sonnet (v4).
- **Context construction:** Only pre-aggregated metrics from the `DashboardContext` are used as the AI context.
- **Conversation memory:** Last 6 messages (3 user/assistant pairs) are included for continuity.

---

### API Route Summaries

**1. `/app/api/query/route.ts` — User-driven natural language Q&A**

- **Input:**  
  `{ question: string, history: Message[] }`
- **Process:**  
  - Builds a context object from `DashboardContext` (precomputed, not raw logs)
  - Extracts and formats the last 6 messages of history
  - Passes both into a structured system prompt for Claude Sonnet
- **Output:**  
  `{ answer: string }`

**2. `/app/api/analyze/route.ts` — Proactive insight and recommendation generation**

- **Input:**  
  `{ data: DashboardContext }`
- **Process:**  
  - Generates AI insights: anomalies, trends, recommendations, risks (`AIInsight[]`)
  - Creates cost optimization recommendations (`OptimizationRecommendation[]`)
  - Drafts an executive summary for dashboard display
- **Output:**  
  `{ insights: AIInsight[], recommendations: OptimizationRecommendation[], executiveSummary: string }`

---

### `DashboardContext` Object (Passed to AI)

> **Never includes raw logs — only metrics summaries.**

```typescript
interface DashboardContext {
  period: string // e.g. "May 2026"
  totalSpend: number
  totalROI: number
  efficiencyScore: number
  wasteRatio: number
  hoursSaved: number
  activeUsers: number
  underusedSeats: number

  byTeam: {
    name: Team
    spend: number
    roi: number
    cpt: number
    efficiencyScore: number
    topTool: Tool
    activeUsers: number
    wasteRatio: number
  }[]

  byTool: {
    name: Tool
    spend: number
    roi: number
    seatUtilization: number // 0-1
    activeSeats: number
    totalSeats: number
  }[]

  byModel: {
    name: Model
    spend: number
    avgComplexityScore: number
    mismatchRate: number // % calls where model tier > task complexity
  }[]

  anomalies: {
    description: string
    magnitude: string // e.g. "3x above baseline"
    affectedEntity: string
    week: string
  }[]

  topSpenders: { // top 5 users by cost
    user: string
    team: Team
    spend: number
    roi: number
    primaryTool: Tool
  }[]

  lowProductivity: { // users with ROI < 100%
    user: string
    team: Team
    spend: number
    roi: number
    issue: string // e.g. "high cost, low hours saved"
  }[]
}
```

---

### System Prompt (for `/api/query`)

Design a single, structured, reproducible system prompt. Key instructions:

- **Always cite numbers from the data**
- **Do not extrapolate/generate data not present**
- **Acknowledge missing users/teams**
- **Be concise & answer in user's language**

Prompt (paraphrased):

>You are an AI usage intelligence analyst for an enterprise dashboard called AIControlCenter.  
>You have access to the following pre-computed organizational data for {period}:  
>{JSON.stringify(context, null, 2)}  
>You can answer questions about:
>
> - team overspending/low ROI
> - user productivity extremes
> - tool utilization/inefficiency
> - need for AI training (low ROI users)
> - cost optimization opportunities
> - anomalies/unusual patterns
> - model selection efficiency  
>
>**Rules:**
>
>- Always cite specific numbers from the data  
>- If asked about a user/team not in data, say explicitly  
>- Be concise (2-4 sentences unless more detail requested)  
>- Never fabricate data  
>- Answer in the same language as the question

---

### Conversation History Inclusion

Pattern:  
- Take last 6 messages (user + assistant, up to 3 exchanges)
- Truncate each message to 300 characters
- Format as
  ```
  User: ...
  Assistant: ...
  User: ...
  ```
- Prepend `"Conversation so far:\n"` before system prompt to support short-term memory/follow-ups

> No persistent or server-side conversation state; all history management is in `QueryAssistant` React state.

---

### Token Budget

- DashboardContext: 800-1200 tokens
- History: 300-500 tokens (6 messages, ≤300 chars each)
- System prompt: 400 tokens
- **Total input:** 1500-2100 tokens per call
- Max output: 500 tokens (concise answers mandated)
- Fits within Claude Sonnet v4 limits

---

### Expected Q&A Scenarios

| Example Question                    | Data Source             |
|------------------------------------- |------------------------|
| Which team overspent this month?     | byTeam (spend vs ROI)  |
| Who is the most productive user?     | topSpenders (highest ROI) |
| Who needs more AI training?          | lowProductivity (ROI < 100%) |
| Which tool has the worst ROI?        | byTool (lowest ROI)    |
| Why did costs spike last week?       | anomalies              |
| Which model is being wasted?         | byModel (mismatchRate) |
| Where can we cut costs safely?       | byTool (seatUtilization < 0.3) |

---

This design ensures safe, efficient, and explainable AI-driven Q&A on your organizational AI usage.

---

## Vendor Adapter Layer

### Purpose

Each AI vendor exposes usage data in a different raw format.  
The adapter layer normalizes all vendor formats into a single `UsageLog` —  
the only data model the rest of the system knows about.

**Rule: nothing outside `/lib/adapters/` ever sees raw vendor data.**

### Location

/lib/adapters/

shared.ts                  ← heuristics shared by all adapters  
cursor.adapter.ts          ← Cursor IDE raw → UsageLog  
anthropic.adapter.ts       ← Anthropic API raw → UsageLog  
openai.adapter.ts          ← OpenAI API raw → UsageLog  
github-copilot.adapter.ts  ← GitHub Copilot raw → UsageLog  
index.ts                   ← single entry point, exports adaptAll()

### Data Flow

CursorRawRecord[]          →  cursor.adapter.ts     ↘  
AnthropicRawRecord[]       →  anthropic.adapter.ts  →  UsageLog[]  →  /lib/analytics.ts  
OpenAIRawRecord[]          →  openai.adapter.ts     ↗  
GitHubCopilotRawRecord[]   →  github-copilot.adapter.ts

### Usage

```typescript
import { adaptAll } from "@/lib/adapters"

const logs = adaptAll({
  cursor:        cursorRawData,
  anthropic:     anthropicRawData,
  openai:        openaiRawData,
  githubCopilot: copilotRawData,
})
// → UsageLog[], sorted by date ascending
```

### Heuristics (shared.ts)

Fields that don't exist in vendor APIs are inferred:

| Field                 | Source                                                             |
|-----------------------|--------------------------------------------------------------------|
| `complexityScore`     | model tier baseline + usageType modifier + ±2 variance             |
| `estimatedHoursSaved` | outputTokens × per-usageType multiplier                            |
| `successfulTasks`     | requests × per-usageType success rate                              |
| `cost`                | token counts × public pricing per 1K tokens (or seat cost for Copilot/Cursor) |

### Adding a New Vendor

1. Create `/lib/adapters/{vendor}.adapter.ts`
2. Define `{Vendor}RawRecord` interface matching the vendor's export format
3. Implement `adapt{Vendor}Record(raw, index): UsageLog`
4. Export from `index.ts` and add to `adaptAll()`
5. No other files need to change

### Current Status (prototype)

All adapters use mock raw data defined in `/data/mock_logs.json`.  
In production, raw records would be fetched from vendor APIs  
via the connector defined in `/app/integrations/`.