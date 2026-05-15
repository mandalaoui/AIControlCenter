# UI/UX Guidelines

## Design Philosophy

Enterprise-grade. Accessible. Efficient. No decoration for decoration's sake.

Every visual element must serve information delivery.

## Stack

- React + Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui (base components)
- Recharts (all charts)
- i18next (EN/HE, RTL/LTR)
- next-themes (dark/light)

## Layout

- Left sidebar: fixed, 240px, navigation only
- Top navbar: fixed, org selector + time filter + search + theme toggle + lang toggle
- Main content: scrollable, max-width 1400px, padding 24px
- Grid: 12-column, sections use 4-col or 6-col cards

## Component Rules

- Every component is in `/components/` — no inline logic
- Business logic lives in `/lib/analytics.ts` only
- Reusable card wrapper: `<DashboardCard>` with title, optional badge, children
- AI insight boxes: left border accent, muted background, small icon
- No component exceeds 150 lines — split if needed

## Color System (Tailwind classes only)

Background:     `bg-background`  
Surface:        `bg-card`  
Border:         `border-border`  
Primary text:   `text-foreground`  
Muted text:     `text-muted-foreground`  
Accent (AI):    `text-blue-500` / `border-blue-500`  
Success:        `text-green-500`  
Warning:        `text-amber-500`  
Danger:         `text-red-500`  

## Typography

- Section titles: `text-2xl font-semibold`
- Card titles: `text-sm font-medium text-muted-foreground uppercase tracking-wide`
- KPI values: `text-3xl font-bold`
- Trend indicators: `text-sm` with colored arrow icon
- AI insight text: `text-sm`, italic, muted with blue left border

## Charts (Recharts)

- All charts use CSS variable colors, not hardcoded hex
- Tooltips: always custom, styled with card background
- Line charts: always show data point dots
- Bar charts: rounded top corners (`radius={4}`)
- No 3D effects, no gradients on bars
- Add reference lines where analytically meaningful

## Badges / Tags

- Risk levels: outlined variant only (not filled)
  - low: green outlined
  - medium: amber outlined  
  - high: red outlined
- Impact badges: subtle background, no aggressive fills
- AI-generated labels: always accompanied by small sparkle icon (✦)

## Internationalization

- All user-facing strings via i18next
- RTL support via `dir` attribute on `<html>`
- Sidebar and layout must mirror correctly in HE mode
- Numbers and currencies: always LTR even in RTL context

## Dark / Light Mode

- Use next-themes — never hardcode colors
- Toggle in top navbar
- All components must work in both modes without exceptions

## What to Avoid

- No animations except subtle fade-in on page load (150ms)
- No glassmorphism
- No gradient backgrounds on large surfaces
- No filled/solid colored buttons except primary CTA
- No crowded layouts — if it feels tight, add spacing
- No consumer-app patterns (no stories, no avatars grid, no emoji-heavy UI)