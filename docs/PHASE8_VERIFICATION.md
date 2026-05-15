# Phase 8 — Theme & RTL Verification Checklist

## Dark / Light mode

All pages use semantic Tailwind tokens (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`). Charts use CSS variables (`--chart-1` … `--chart-5`) defined in `app/globals.css` for both `:root` and `.dark`.

| Page | Verified |
|------|----------|
| Overview `/` | ✓ |
| Cost Analytics | ✓ |
| ROI & Efficiency | ✓ |
| Teams | ✓ |
| Tools & Models | ✓ |
| Tools Directory | ✓ |
| Usage Logs | ✓ |
| AI Insights | ✓ |
| Optimization | ✓ |
| Query Assistant | ✓ |
| AI News | ✓ |
| Integrations | ✓ |
| Settings | ✓ |

Toggle via TopBar (moon/sun) or Settings → Theme.

## RTL (Hebrew)

- `document.documentElement.dir` set to `rtl` when language is `he` (`components/i18n-provider.tsx`).
- Sidebar mirrors to the right in RTL (flex row + `dir=rtl` on `<html>`).
- Logical properties used: `start`/`end`, `border-s`/`border-e`, `ps`/`pe`, `text-start`.
- Currency and numbers use `dir="ltr"` where displayed (KPI cards, tables, ROI).
- Tool detail sheet opens from **left** in Hebrew (`tools-directory-view.tsx`).
- Usage log dates use `he-IL` locale when language is Hebrew.

Toggle via TopBar (Languages) or Settings → Language.

## AI error states

| Component | Loading | Error |
|-----------|---------|-------|
| AI Insights | `InsightCardsSkeleton` | `AiErrorState` + retry |
| Optimization | `InsightCardsSkeleton` | `AiErrorState` + retry |
| Query Assistant | Inline spinner | `AiErrorState` compact |
| AI News | `CardGridSkeleton` | `AiErrorState` compact; shows cached items when available |

## Loading skeletons

| Route | Mechanism |
|-------|-----------|
| `/` | `DeferredContent` + `OverviewPageSkeleton` |
| `/cost-analytics` | `DeferredContent` + chart skeleton |
| `/teams` | `DeferredContent` + card grid skeleton |
| `/usage-logs` | `DeferredContent` + table skeleton |
| `/tools-models`, `/tools-directory`, `/roi-efficiency` | `loading.tsx` route files |
| AI pages | In-component skeletons during fetch |
