import type { AiNewsResponse, NewsItem } from "@/lib/types";

const FALLBACK_NEWS: NewsItem[] = [
  {
    id: "fb-1",
    title: "Anthropic releases Claude Sonnet 4 with improved coding benchmarks",
    summary:
      "Claude Sonnet 4 delivers stronger reasoning and code generation at mid-tier pricing, with a 200K context window across the Claude family.",
    source: "Anthropic",
    category: "new-models",
    url: "https://www.anthropic.com/news",
    publishedAt: "2025-05-01",
  },
  {
    id: "fb-2",
    title: "OpenAI cuts GPT-4o-mini input pricing for high-volume workloads",
    summary:
      "OpenAI adjusted token pricing for GPT-4o-mini, making high-volume classification and summarization more cost-effective for enterprise automations.",
    source: "OpenAI",
    category: "pricing",
    url: "https://openai.com/pricing",
    publishedAt: "2025-04-28",
  },
  {
    id: "fb-3",
    title: "GitHub Copilot expands agent mode for multi-file repository edits",
    summary:
      "Copilot's agent mode now supports broader repository context and task planning, positioning it closer to IDE-native autonomous coding assistants.",
    source: "GitHub",
    category: "new-tools",
    url: "https://github.blog",
    publishedAt: "2025-04-25",
  },
  {
    id: "fb-4",
    title: "Enterprise AI spend governance becomes a board-level priority",
    summary:
      "CFOs and platform teams are adopting unified AI cost dashboards to align tool adoption with measurable ROI and seat utilization targets.",
    source: "Industry",
    category: "industry",
    url: "https://example.com/ai-governance",
    publishedAt: "2025-04-20",
  },
  {
    id: "fb-5",
    title: "Google Gemini 2.5 Flash targets low-latency agent workflows",
    summary:
      "Gemini Flash emphasizes speed and cost for agentic pipelines, with competitive per-million-token rates for high-throughput applications.",
    source: "Google",
    category: "new-models",
    url: "https://ai.google.dev",
    publishedAt: "2025-04-18",
  },
  {
    id: "fb-6",
    title: "Cursor introduces team analytics for seat utilization tracking",
    summary:
      "Cursor added organization-level usage visibility, helping engineering leaders identify inactive seats and optimize IDE AI subscriptions.",
    source: "Cursor",
    category: "new-tools",
    url: "https://cursor.com",
    publishedAt: "2025-04-15",
  },
  {
    id: "fb-7",
    title: "Microsoft 365 Copilot seat bundles shift to usage-based add-ons",
    summary:
      "Microsoft is piloting flexible Copilot licensing tied to active users rather than flat per-seat bundles for large enterprises.",
    source: "Microsoft",
    category: "pricing",
    url: "https://www.microsoft.com/microsoft-365",
    publishedAt: "2025-04-12",
  },
  {
    id: "fb-8",
    title: "Slack AI summarization expands to cross-channel workflow insights",
    summary:
      "Slack AI now surfaces channel-level productivity summaries, helping teams evaluate communication-tool ROI alongside dev tooling.",
    source: "Slack",
    category: "new-tools",
    url: "https://slack.com/ai",
    publishedAt: "2025-04-10",
  },
];

export function buildFallbackNewsResponse(): AiNewsResponse {
  return {
    items: FALLBACK_NEWS,
    lastUpdated: new Date().toISOString(),
    fromCache: false,
  };
}
