# AIControlCenter — Project Context

## Product
**Name:** AIControlCenter  
**Type:** Enterprise SaaS — AI Cost & Usage Intelligence Platform  
**One-liner:** Unified platform for monitoring, optimizing, and understanding 
AI tool usage, cost, and ROI across an organization.

## The Problem
Companies use multiple AI tools (GPT-4, Claude, Gemini, Cursor, Copilot, 
Slack AI, internal agents) with no unified visibility into:
- Where money is being spent
- Which tools and teams generate real ROI
- Where waste is occurring
- What actions to take

## Target User
**Primary:** AI Platform Teams, Engineering Managers, CTOs  
**Technical level:** Semi-technical — they understand data but don't want 
to write queries  
**Context:** They attend executive meetings and need defensible numbers fast

## Core Goals (Priority Order)
1. Improve AI ROI visibility across the organization
2. Optimize tool selection and reduce waste
3. Drive informed adoption decisions

## AI Positioning
AI is an embedded intelligence layer — not a chatbot bolted on.
Every section of the dashboard surfaces AI-generated context.
The system should feel like it already understands your data before 
you ask.

## Product Principles
- Clarity over aesthetics — every element must earn its place
- No flashy animations, no cyberpunk, no consumer-app feel
- Enterprise-grade: accessible, efficient, scannable
- KPI + AI summary heavy, not chart-heavy
- AI insights are dominant and central, not subtle

## Multi-Tenant Architecture (Simulated)
The system is designed as if it supports multiple organizations/workspaces.
Currently: single org ("Acme Corp") with teams, users, and tools.
Architecture should support future: org → teams → users → usage logs.

## Integrations (Simulated)
Connectors exist architecturally but use mock data:
- OpenAI API, Anthropic API, GitHub Copilot, Cursor,
  Microsoft Copilot, Slack AI, Google Gemini, Internal AI Agents
Each connector has: status, last sync time, data type description.
Built as if real connectors could be plugged in later.

## Scope — MVP (All Required)
- Executive Overview (KPI cards with embedded AI insights)
- Cost Breakdown (by provider, over time)
- ROI & Efficiency (by team, by tool)
- Teams view
- Tools & Models view
- AI Insights panel
- Optimization Center
- Query Assistant (Natural Language)
- Smart Usage Logs (AI-categorized)
- Integrations page
- Dark / Light mode
- EN / HE (i18next)
- Responsive layout