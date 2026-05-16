/**
 * Enterprise-scale raw telemetry generator.
 * Run: npx tsx scripts/expand-raw-telemetry.ts
 */
import fs from "fs";
import path from "path";

import type { OpenAIRawRecord } from "@/lib/adapters/openai.adapter";
import type { AnthropicRawRecord } from "@/lib/adapters/anthropic.adapter";
import type { CursorRawRecord } from "@/lib/adapters/cursor.adapter";
import type { GitHubCopilotRawRecord } from "@/lib/adapters/github-copilot.adapter";
import { adaptAll } from "@/lib/adapters";

const RAW_DIR = path.join(process.cwd(), "data", "raw");

const COUNTS = {
  openai: 320,
  anthropic: 320,
  cursor: 200,
  copilot: 260,
} as const;

/** Tune total spend into $15k–$40k band after adapter pricing. */
const SPEND_CALIBRATION = 1.15;

type SpendTier = "whale" | "heavy" | "medium" | "light" | "ghost";

interface OrgUser {
  id: string;
  name: string;
  email: string;
  login: string;
  team: string;
  tier: SpendTier;
  weight: number;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

function pickWeighted<T>(
  rng: () => number,
  items: readonly T[],
  weights: readonly number[],
): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i]!;
    if (roll <= 0) return items[i]!;
  }
  return items[items.length - 1]!;
}

function padId(prefix: string, n: number, width = 4): string {
  return `${prefix}_${String(n).padStart(width, "0")}`;
}

function isoDate(day: number, hour: number, minute: number): string {
  return `2026-05-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`;
}

function dayString(day: number): string {
  return `2026-05-${String(day).padStart(2, "0")}`;
}

function scaleTokens(value: number): number {
  return Math.max(1, Math.round(value * SPEND_CALIBRATION));
}

// ─── Shared org user roster (Pareto-weighted) ─────────────────

function buildOrgUsers(): OrgUser[] {
  const roster: Array<Omit<OrgUser, "id" | "weight" | "tier"> & { tier: SpendTier }> = [
    { name: "David Kim", email: "david.kim@company.com", login: "david.kim", team: "Engineering", tier: "whale" },
    { name: "Tom Richards", email: "tom.richards@company.com", login: "tom.richards", team: "Engineering", tier: "whale" },
    { name: "Priya Patel", email: "priya.patel@company.com", login: "priya.patel", team: "Engineering", tier: "whale" },
    { name: "Alex Johnson", email: "alex.johnson@company.com", login: "alex.johnson", team: "Engineering", tier: "whale" },
    { name: "Nina Ortiz", email: "nina.ortiz@company.com", login: "nina.ortiz", team: "Engineering", tier: "whale" },
    { name: "Anna Novak", email: "anna.novak@company.com", login: "anna.novak", team: "Product", tier: "whale" },
    { name: "Marcus Webb", email: "marcus.webb@company.com", login: "marcus.webb", team: "Engineering", tier: "whale" },
    { name: "Sophia Turner", email: "sophia.turner@company.com", login: "sophia.turner", team: "Customer Success", tier: "whale" },
    { name: "Phoebe Buffay", email: "phoebe.buffay@company.com", login: "phoebe.buffay", team: "Engineering", tier: "heavy" },
    { name: "Henry Nguyen", email: "henry.nguyen@company.com", login: "henry.nguyen", team: "Engineering", tier: "heavy" },
    { name: "Sarah Chen", email: "sarah.chen@company.com", login: "sarah.chen", team: "Engineering", tier: "heavy" },
    { name: "Jordan Lee", email: "jordan.lee@company.com", login: "jordan.lee", team: "Product", tier: "heavy" },
    { name: "Taylor Brooks", email: "taylor.brooks@company.com", login: "taylor.brooks", team: "Product", tier: "heavy" },
    { name: "Rachel Green", email: "rachel.green@company.com", login: "rachel.green", team: "Marketing", tier: "heavy" },
    { name: "Emily Li", email: "emily.li@company.com", login: "emily.li", team: "Marketing", tier: "heavy" },
    { name: "Monica Geller", email: "monica.geller@company.com", login: "monica.geller", team: "Sales", tier: "heavy" },
    { name: "James Carter", email: "james.carter@company.com", login: "james.carter", team: "Sales", tier: "heavy" },
    { name: "Emma Wilson", email: "emma.wilson@company.com", login: "emma.wilson", team: "Customer Success", tier: "heavy" },
    { name: "Chris Lee", email: "chris.lee@company.com", login: "chris.lee", team: "Customer Success", tier: "heavy" },
    { name: "Li Wang", email: "li.wang@company.com", login: "li.wang", team: "Operations", tier: "heavy" },
    { name: "Sam Rivera", email: "sam.rivera@company.com", login: "sam.rivera", team: "Operations", tier: "heavy" },
    { name: "Casey Morgan", email: "casey.morgan@company.com", login: "casey.morgan", team: "Product", tier: "heavy" },
    { name: "Danielle Smith", email: "danielle.smith@company.com", login: "danielle.smith", team: "Marketing", tier: "heavy" },
    { name: "Mike Hardy", email: "mike.hardy@company.com", login: "mike.hardy", team: "Sales", tier: "heavy" },
    { name: "Olivia Schmidt", email: "olivia.schmidt@company.com", login: "olivia.schmidt", team: "Customer Success", tier: "medium" },
    { name: "Maya Patel", email: "maya.patel@company.com", login: "maya.patel", team: "Customer Success", tier: "medium" },
    { name: "Chris Parker", email: "chris.parker@company.com", login: "chris.parker", team: "Marketing", tier: "medium" },
    { name: "Pat Quinn", email: "pat.quinn@company.com", login: "pat.quinn", team: "Operations", tier: "medium" },
    { name: "Jordan Kim", email: "jordan.kim@company.com", login: "jordan.kim", team: "Engineering", tier: "medium" },
    { name: "Elena Rossi", email: "elena.rossi@company.com", login: "elena.rossi", team: "Product", tier: "medium" },
    { name: "Noah Stein", email: "noah.stein@company.com", login: "noah.stein", team: "Engineering", tier: "medium" },
    { name: "Ava Mitchell", email: "ava.mitchell@company.com", login: "ava.mitchell", team: "Sales", tier: "medium" },
    { name: "Liam Foster", email: "liam.foster@company.com", login: "liam.foster", team: "Marketing", tier: "medium" },
    { name: "Zoe Bennett", email: "zoe.bennett@company.com", login: "zoe.bennett", team: "Operations", tier: "medium" },
    { name: "Ryan Cooper", email: "ryan.cooper@company.com", login: "ryan.cooper", team: "Engineering", tier: "light" },
    { name: "Grace Holt", email: "grace.holt@company.com", login: "grace.holt", team: "Marketing", tier: "light" },
    { name: "Ethan Price", email: "ethan.price@company.com", login: "ethan.price", team: "Sales", tier: "light" },
    { name: "Idle Coder", email: "idle.coder@company.com", login: "idle.coder", team: "Engineering", tier: "ghost" },
    { name: "Ghost Seat", email: "ghost.seat@company.com", login: "ghost.seat", team: "Sales", tier: "ghost" },
    { name: "Unused Seat", email: "unused.seat@company.com", login: "unused.seat", team: "Marketing", tier: "ghost" },
    { name: "Inactive Dev", email: "inactive.dev@company.com", login: "inactive.dev", team: "Engineering", tier: "ghost" },
    { name: "Low ROI User", email: "low.roi@company.com", login: "low.roi", team: "Marketing", tier: "light" },
  ];

  const tierWeight: Record<SpendTier, number> = {
    whale: 48,
    heavy: 12,
    medium: 2.5,
    light: 0.45,
    ghost: 0.04,
  };

  return roster.map((u, i) => ({
    ...u,
    id: `user_${String(i + 1).padStart(3, "0")}`,
    weight: tierWeight[u.tier],
  }));
}

function buildWeightedDeck(users: OrgUser[], rng: () => number): OrgUser[] {
  const deck: OrgUser[] = [];
  for (const user of users) {
    const copies = Math.max(1, Math.round(user.weight));
    for (let i = 0; i < copies; i++) deck.push(user);
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

function pickUser(deck: OrgUser[], index: number): OrgUser {
  return deck[index % deck.length]!;
}

// ─── Token / session profiles by tier ───────────────────────

function apiTokenProfile(
  tier: SpendTier,
  rng: () => number,
  premium: boolean,
): { prompt: number; completion: number } {
  if (tier === "ghost") {
    return {
      prompt: scaleTokens(400 + Math.floor(rng() * 2500)),
      completion: scaleTokens(80 + Math.floor(rng() * 400)),
    };
  }
  if (tier === "light") {
    return {
      prompt: scaleTokens(2000 + Math.floor(rng() * 13000)),
      completion: scaleTokens(400 + Math.floor(rng() * 3500)),
    };
  }
  if (tier === "medium") {
    return {
      prompt: scaleTokens(15000 + Math.floor(rng() * 65000)),
      completion: scaleTokens(3000 + Math.floor(rng() * 18000)),
    };
  }
  if (tier === "heavy") {
    return {
      prompt: scaleTokens(80000 + Math.floor(rng() * 170000)),
      completion: scaleTokens(15000 + Math.floor(rng() * 55000)),
    };
  }
  // whale + optional mega automation burst
  const mega = premium && rng() < 0.18;
  if (mega) {
    return {
      prompt: scaleTokens(650000 + Math.floor(rng() * 350000)),
      completion: scaleTokens(180000 + Math.floor(rng() * 120000)),
    };
  }
  return {
    prompt: scaleTokens(180000 + Math.floor(rng() * 320000)),
    completion: scaleTokens(45000 + Math.floor(rng() * 95000)),
  };
}

function cursorSessionProfile(
  tier: SpendTier,
  rng: () => number,
  feature: CursorRawRecord["feature"],
): {
  total_completions: number;
  accepted_completions: number;
  completion_tokens: number;
  prompt_tokens: number;
  active_duration_seconds: number;
} {
  if (tier === "ghost") {
    return {
      total_completions: Math.floor(rng() * 2),
      accepted_completions: 0,
      completion_tokens: scaleTokens(200 + Math.floor(rng() * 800)),
      prompt_tokens: scaleTokens(50 + Math.floor(rng() * 200)),
      active_duration_seconds: 60 + Math.floor(rng() * 240),
    };
  }
  if (tier === "light") {
    const total = 8 + Math.floor(rng() * 28);
    return {
      total_completions: total,
      accepted_completions: Math.floor(total * (0.25 + rng() * 0.35)),
      completion_tokens: scaleTokens(4000 + Math.floor(rng() * 22000)),
      prompt_tokens: scaleTokens(800 + Math.floor(rng() * 4000)),
      active_duration_seconds: 600 + Math.floor(rng() * 2400),
    };
  }
  if (tier === "medium") {
    const total = 45 + Math.floor(rng() * 95);
    return {
      total_completions: total,
      accepted_completions: Math.floor(total * (0.35 + rng() * 0.4)),
      completion_tokens: scaleTokens(35000 + Math.floor(rng() * 120000)),
      prompt_tokens: scaleTokens(5000 + Math.floor(rng() * 25000)),
      active_duration_seconds: 1800 + Math.floor(rng() * 5400),
    };
  }
  if (tier === "heavy") {
    const total = 120 + Math.floor(rng() * 280);
    return {
      total_completions: total,
      accepted_completions: Math.floor(total * (0.4 + rng() * 0.35)),
      completion_tokens: scaleTokens(120000 + Math.floor(rng() * 380000)),
      prompt_tokens: scaleTokens(15000 + Math.floor(rng() * 60000)),
      active_duration_seconds: 3600 + Math.floor(rng() * 9000),
    };
  }
  // whale — agent-scale IDE workflow
  const total =
    feature === "agent"
      ? 280 + Math.floor(rng() * 920)
      : 90 + Math.floor(rng() * 210);
  const mega = feature === "agent" && rng() < 0.22;
  return {
    total_completions: total,
    accepted_completions: Math.floor(total * (0.42 + rng() * 0.38)),
    completion_tokens: scaleTokens(
      mega
        ? 950000 + Math.floor(rng() * 550000)
        : 250000 + Math.floor(rng() * 450000),
    ),
    prompt_tokens: scaleTokens(25000 + Math.floor(rng() * 120000)),
    active_duration_seconds: 7200 + Math.floor(rng() * 14400),
  };
}

function copilotDayProfile(
  tier: SpendTier,
  rng: () => number,
): {
  suggestions_count: number;
  acceptances_count: number;
  chat_turns: number;
  chat_acceptances: number;
  lines_suggested: number;
  lines_accepted: number;
  active_time_seconds: number;
  seat_active: boolean;
} {
  if (tier === "ghost") {
    return {
      suggestions_count: 0,
      acceptances_count: 0,
      chat_turns: 0,
      chat_acceptances: 0,
      lines_suggested: 0,
      lines_accepted: 0,
      active_time_seconds: 0,
      seat_active: false,
    };
  }
  if (tier === "light") {
    const suggestions = 6 + Math.floor(rng() * 22);
    const acceptances = Math.floor(suggestions * (0.12 + rng() * 0.25));
    const chat = Math.floor(rng() * 4);
    return {
      suggestions_count: suggestions,
      acceptances_count: acceptances,
      chat_turns: chat,
      chat_acceptances: Math.floor(chat * rng() * 0.5),
      lines_suggested: suggestions * (6 + Math.floor(rng() * 8)),
      lines_accepted: acceptances * (5 + Math.floor(rng() * 6)),
      active_time_seconds: 900 + Math.floor(rng() * 2400),
      seat_active: rng() > 0.2,
    };
  }
  if (tier === "medium") {
    const suggestions = 35 + Math.floor(rng() * 85);
    const acceptances = Math.floor(suggestions * (0.22 + rng() * 0.28));
    const chat = 4 + Math.floor(rng() * 18);
    return {
      suggestions_count: suggestions,
      acceptances_count: acceptances,
      chat_turns: chat,
      chat_acceptances: Math.floor(chat * (0.25 + rng() * 0.45)),
      lines_suggested: suggestions * (9 + Math.floor(rng() * 10)),
      lines_accepted: Math.floor(acceptances * (7 + rng() * 5)),
      active_time_seconds: 3600 + Math.floor(rng() * 7200),
      seat_active: true,
    };
  }
  if (tier === "heavy") {
    const suggestions = 95 + Math.floor(rng() * 180);
    const acceptances = Math.floor(suggestions * (0.35 + rng() * 0.25));
    const chat = 12 + Math.floor(rng() * 40);
    return {
      suggestions_count: suggestions,
      acceptances_count: acceptances,
      chat_turns: chat,
      chat_acceptances: Math.floor(chat * (0.3 + rng() * 0.5)),
      lines_suggested: suggestions * (11 + Math.floor(rng() * 9)),
      lines_accepted: Math.floor(acceptances * (8 + rng() * 4)),
      active_time_seconds: 8000 + Math.floor(rng() * 10000),
      seat_active: true,
    };
  }
  // whale
  const suggestions = 220 + Math.floor(rng() * 580);
  const acceptances = Math.floor(suggestions * (0.38 + rng() * 0.22));
  const chat = 35 + Math.floor(rng() * 120);
  return {
    suggestions_count: suggestions,
    acceptances_count: acceptances,
    chat_turns: chat,
    chat_acceptances: Math.floor(chat * (0.35 + rng() * 0.45)),
    lines_suggested: suggestions * (12 + Math.floor(rng() * 8)),
    lines_accepted: Math.floor(acceptances * (9 + rng() * 3)),
    active_time_seconds: 12000 + Math.floor(rng() * 18000),
    seat_active: true,
  };
}

// ─── OpenAI ───────────────────────────────────────────────────

const OPENAI_PREMIUM = [
  "gpt-4",
  "gpt-4-turbo",
  "gpt-4-turbo-2024-04-09",
  "o1",
  "gpt-4o-2024-11-20",
] as const;

const OPENAI_MID = ["gpt-4o", "gpt-4.1", "o1-mini", "o3-mini"] as const;

const OPENAI_CHEAP = [
  "gpt-4o-mini",
  "gpt-4o-mini-2024-07-18",
  "gpt-4.1-mini",
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-0125",
] as const;

const OPENAI_PURPOSES = [
  "code-generation",
  "code-review",
  "chat-support",
  "customer-support",
  "content-creation",
  "copywriting",
  "data-analysis",
  "research",
  "summarization",
  "automation",
  "document-qa",
  "email-drafting",
] as const;

const OPENAI_FINISH: OpenAIRawRecord["finish_reason"][] = [
  "stop",
  "stop",
  "stop",
  "tool_calls",
  "length",
  "content_filter",
  "null",
];

const OPENAI_KEYS: Record<string, { org: string; keyId: string; keyName: string }> = {
  Engineering: { org: "org_engineering", keyId: "key_eng_01", keyName: "eng-prod-key" },
  Product: { org: "org_product", keyId: "key_prod_01", keyName: "product-key" },
  Marketing: { org: "org_marketing", keyId: "key_mkt_01", keyName: "marketing-prod-key" },
  Sales: { org: "org_sales", keyId: "key_sales_01", keyName: "sales-key" },
  Operations: { org: "org_ops", keyId: "key_ops_01", keyName: "ops-automation-key" },
  "Customer Success": { org: "org_support", keyId: "key_support_01", keyName: "support-key" },
};

function pickOpenAIModel(tier: SpendTier, rng: () => number): string {
  if (tier === "ghost" || tier === "light") {
    return pick(rng, OPENAI_CHEAP);
  }
  if (tier === "medium") {
    return pickWeighted(rng, [...OPENAI_MID, ...OPENAI_CHEAP], [0.55, 0.45]);
  }
  if (tier === "heavy") {
    return pickWeighted(rng, [...OPENAI_PREMIUM, ...OPENAI_MID], [0.72, 0.28]);
  }
  return pickWeighted(rng, [...OPENAI_PREMIUM, ...OPENAI_MID], [0.82, 0.18]);
}

function generateOpenAI(users: OrgUser[], deck: OrgUser[]): OpenAIRawRecord[] {
  const rng = mulberry32(42);
  const records: OpenAIRawRecord[] = [];

  for (let i = 1; i <= COUNTS.openai; i++) {
    const user = pickUser(deck, i);
    const team = user.team;
    const keys = OPENAI_KEYS[team] ?? OPENAI_KEYS.Engineering!;

    const isMismatch = i % 23 === 0;
    const isLowRoi = user.name === "Low ROI User";
    const isSpike = i >= 250 && i <= 272;

    let model = pickOpenAIModel(user.tier, rng);
    let purpose = pick(rng, OPENAI_PURPOSES);

    if (user.tier === "whale" || user.tier === "heavy") {
      purpose = pick(rng, ["code-generation", "code-review", "automation", "data-analysis"]);
    }
    if (isMismatch) {
      model = "gpt-4-turbo";
      purpose = pick(rng, ["chat-support", "email-drafting", "summarization"]);
    }
    if (isLowRoi) {
      model = "gpt-4";
      purpose = "content-creation";
    }

    const premium =
      model.includes("gpt-4") || model.startsWith("o1");
    const tokens = apiTokenProfile(user.tier, rng, premium);
    const prompt_tokens = tokens.prompt;
    const completion_tokens = tokens.completion;

    let finish_reason = pick(rng, OPENAI_FINISH);
    if (isLowRoi) finish_reason = "length";
    if (purpose === "automation" && user.tier === "whale") finish_reason = "tool_calls";

    const day = isSpike ? 14 + (i % 4) : 1 + Math.floor(rng() * 27);

    records.push({
      request_id: padId("req", i),
      created_at: isoDate(day, 8 + Math.floor(rng() * 11), Math.floor(rng() * 60)),
      organization_id: keys.org,
      api_key_id: keys.keyId,
      api_key_name: keys.keyName,
      model,
      prompt_tokens,
      completion_tokens,
      total_tokens: prompt_tokens + completion_tokens,
      finish_reason,
      user_display_name: user.name,
      team_name: team,
      purpose_tag: purpose,
    });
  }

  return records;
}

// ─── Anthropic ────────────────────────────────────────────────

const ANTHROPIC_PREMIUM = [
  "claude-opus-4-20250514",
  "claude-opus-4",
  "claude-3-opus-20240229",
] as const;

const ANTHROPIC_MID = [
  "claude-sonnet-4-20250514",
  "claude-sonnet-4",
  "claude-3-5-sonnet-20241022",
] as const;

const ANTHROPIC_CHEAP = [
  "claude-haiku-4-5-20251001",
  "claude-haiku-4",
  "claude-3-haiku-20240307",
] as const;

const ANTHROPIC_PURPOSES = [
  "code-review",
  "code-generation",
  "doc-generation",
  "research",
  "support-bot",
  "data-analysis",
  "automation",
  "summarization",
  "email-drafting",
  "report-writing",
] as const;

const ANTHROPIC_STOP: AnthropicRawRecord["stop_reason"][] = [
  "end_turn",
  "end_turn",
  "tool_use",
  "max_tokens",
  "stop_sequence",
];

function pickAnthropicModel(tier: SpendTier, rng: () => number): string {
  if (tier === "ghost" || tier === "light") return pick(rng, ANTHROPIC_CHEAP);
  if (tier === "medium") return pickWeighted(rng, [...ANTHROPIC_MID, ...ANTHROPIC_CHEAP], [0.6, 0.4]);
  if (tier === "heavy") return pickWeighted(rng, [...ANTHROPIC_PREMIUM, ...ANTHROPIC_MID], [0.7, 0.3]);
  return pickWeighted(rng, [...ANTHROPIC_PREMIUM, ...ANTHROPIC_MID], [0.85, 0.15]);
}

function generateAnthropic(users: OrgUser[], deck: OrgUser[]): AnthropicRawRecord[] {
  const rng = mulberry32(137);
  const records: AnthropicRawRecord[] = [];

  for (let i = 1; i <= COUNTS.anthropic; i++) {
    const user = pickUser(deck, i + 17);
    const team = user.team;
    const isWastefulOpus = i % 19 === 0 || (i >= 180 && i <= 195);
    const isSpike = i >= 260 && i <= 285;

    let model = pickAnthropicModel(user.tier, rng);
    let purpose = pick(rng, ANTHROPIC_PURPOSES);

    if (user.tier === "whale" || user.tier === "heavy") {
      purpose = pick(rng, ["code-generation", "automation", "data-analysis"]);
    }
    if (isWastefulOpus) {
      model = "claude-opus-4-20250514";
      purpose = pick(rng, ["support-bot", "email-drafting", "summarization"]);
    }

    const premium = model.includes("opus");
    const tokens = apiTokenProfile(user.tier, rng, premium);
    const input_tokens = tokens.prompt;
    const output_tokens = tokens.completion;
    const cache_read =
      user.tier !== "ghost" && rng() > 0.4
        ? Math.floor(input_tokens * (0.1 + rng() * 0.35))
        : 0;
    const cache_create =
      cache_read > 0 && rng() > 0.55
        ? Math.floor(input_tokens * (0.03 + rng() * 0.1))
        : 0;

    const day = isSpike ? 15 + (i % 3) : 1 + Math.floor(rng() * 27);

    records.push({
      request_id: padId("msg", i),
      created_at: isoDate(day, 8 + Math.floor(rng() * 12), Math.floor(rng() * 60)),
      workspace_id: `${team.toLowerCase().replace(/\s+/g, "-")}-workspace`,
      api_key_name: team,
      model,
      input_tokens,
      output_tokens,
      cache_creation_input_tokens: cache_create,
      cache_read_input_tokens: cache_read,
      stop_reason: pick(rng, ANTHROPIC_STOP),
      user_display_name: user.email,
      team_name: team,
      purpose_tag: purpose,
    });
  }

  return records;
}

// ─── Cursor ───────────────────────────────────────────────────

const CURSOR_PREMIUM = ["claude-opus-4", "gpt-4", "gpt-4o"] as const;
const CURSOR_MID = ["claude-sonnet-4", "cursor-slow", "gemini-pro"] as const;
const CURSOR_CHEAP = ["claude-haiku-4", "gpt-4o-mini", "cursor-fast"] as const;

const CURSOR_FEATURES: CursorRawRecord["feature"][] = [
  "agent",
  "agent",
  "completion",
  "chat",
  "cmd-k",
];

function pickCursorModel(tier: SpendTier, rng: () => number): string {
  if (tier === "ghost" || tier === "light") return pick(rng, CURSOR_CHEAP);
  if (tier === "medium") return pickWeighted(rng, [...CURSOR_MID, ...CURSOR_CHEAP], [0.55, 0.45]);
  if (tier === "heavy") return pickWeighted(rng, [...CURSOR_PREMIUM, ...CURSOR_MID], [0.65, 0.35]);
  return pickWeighted(rng, [...CURSOR_PREMIUM, ...CURSOR_MID], [0.78, 0.22]);
}

function generateCursor(users: OrgUser[], deck: OrgUser[]): CursorRawRecord[] {
  const rng = mulberry32(891);
  const records: CursorRawRecord[] = [];

  for (let i = 1; i <= COUNTS.cursor; i++) {
    const user = pickUser(deck, i + 31);
    const isHugeAgent = user.tier === "whale" && i % 7 === 0;
    const feature = isHugeAgent
      ? "agent"
      : user.tier === "ghost"
        ? "completion"
        : pick(rng, CURSOR_FEATURES);

    const session = cursorSessionProfile(user.tier, rng, feature);
    const day = i >= 140 && i <= 165 ? 16 + (i % 3) : 1 + Math.floor(rng() * 27);

    records.push({
      session_id: padId("cursor", i),
      timestamp: isoDate(day, 8 + Math.floor(rng() * 12), Math.floor(rng() * 60)),
      user_email: user.email,
      user_display_name: user.name,
      team_name: user.team,
      model: pickCursorModel(user.tier, rng),
      feature,
      completion_tokens: session.completion_tokens,
      prompt_tokens: session.prompt_tokens,
      accepted_completions: session.accepted_completions,
      total_completions: session.total_completions,
      active_duration_seconds: session.active_duration_seconds,
      seat_type: user.tier === "whale" || user.tier === "heavy" ? "business" : "pro",
    });
  }

  return records;
}

// ─── GitHub Copilot ───────────────────────────────────────────

const COPILOT_EDITORS: GitHubCopilotRawRecord["editor"][] = [
  "vscode",
  "jetbrains",
  "neovim",
  "github.com",
];

const COPILOT_PREMIUM = ["gpt-4", "gpt-4o", "claude-sonnet"] as const;
const COPILOT_CHEAP = ["gpt-4o-mini", "claude-haiku", "base"] as const;

function pickCopilotModel(tier: SpendTier, rng: () => number): string {
  if (tier === "ghost" || tier === "light") return pick(rng, COPILOT_CHEAP);
  if (tier === "medium") return pickWeighted(rng, ["default", ...COPILOT_CHEAP, ...COPILOT_PREMIUM], [0.2, 0.35, 0.45]);
  return pickWeighted(rng, [...COPILOT_PREMIUM, "default"], [0.75, 0.25]);
}

function generateGitHubCopilot(users: OrgUser[], deck: OrgUser[]): GitHubCopilotRawRecord[] {
  const rng = mulberry32(404);
  const records: GitHubCopilotRawRecord[] = [];

  for (let i = 1; i <= COUNTS.copilot; i++) {
    const user = pickUser(deck, i + 53);
    const day = 1 + Math.floor(rng() * 27);
    const profile = copilotDayProfile(user.tier, rng);

    records.push({
      day: dayString(day),
      user_login: user.login,
      user_display_name: user.name,
      team_name: user.team,
      editor: pick(rng, COPILOT_EDITORS),
      model_version: pickCopilotModel(user.tier, rng),
      suggestions_count: profile.suggestions_count,
      acceptances_count: profile.acceptances_count,
      lines_suggested: profile.lines_suggested,
      lines_accepted: profile.lines_accepted,
      chat_turns: profile.chat_turns,
      chat_acceptances: profile.chat_acceptances,
      active_time_seconds: profile.active_time_seconds,
      seat_type: pickWeighted(rng, ["business", "enterprise"], [0.6, 0.4]),
      seat_active: profile.seat_active,
    });
  }

  return records;
}

// ─── Write + validate ─────────────────────────────────────────

function writeJson(filename: string, data: unknown) {
  const filePath = path.join(RAW_DIR, filename);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Wrote ${filePath} (${Array.isArray(data) ? data.length : "?"} records)`);
}

function validatePareto(logs: { user: string; cost: number }[]) {
  const spendByUser = new Map<string, number>();
  for (const log of logs) {
    spendByUser.set(log.user, (spendByUser.get(log.user) ?? 0) + log.cost);
  }
  const ranked = [...spendByUser.entries()].sort((a, b) => b[1] - a[1]);
  const total = ranked.reduce((s, [, c]) => s + c, 0);
  const topCount = Math.max(1, Math.ceil(ranked.length * 0.1));
  const topSpend = ranked
    .slice(0, topCount)
    .reduce((s, [, c]) => s + c, 0);
  console.log(
    `Pareto check: top ${topCount} users (${((topCount / ranked.length) * 100).toFixed(1)}%) = ${((topSpend / total) * 100).toFixed(1)}% of spend`,
  );
}

const users = buildOrgUsers();
const deck = buildWeightedDeck(users, mulberry32(999));

const openai = generateOpenAI(users, deck);
const anthropic = generateAnthropic(users, deck);
const cursor = generateCursor(users, deck);
const copilot = generateGitHubCopilot(users, deck);

writeJson("openai.raw.json", openai);
writeJson("anthropic.raw.json", anthropic);
writeJson("cursor.raw.json", cursor);
writeJson("github-copilot.raw.json", copilot);

// Fresh read — avoid stale JSON module cache from static imports
const freshLogs = adaptAll({
  openai: JSON.parse(
    fs.readFileSync(path.join(RAW_DIR, "openai.raw.json"), "utf8"),
  ),
  anthropic: JSON.parse(
    fs.readFileSync(path.join(RAW_DIR, "anthropic.raw.json"), "utf8"),
  ),
  cursor: JSON.parse(
    fs.readFileSync(path.join(RAW_DIR, "cursor.raw.json"), "utf8"),
  ),
  githubCopilot: JSON.parse(
    fs.readFileSync(path.join(RAW_DIR, "github-copilot.raw.json"), "utf8"),
  ),
});

const logs = freshLogs;
const totalSpend = logs.reduce((sum, log) => sum + log.cost, 0);
const byTool = new Map<string, number>();
for (const log of logs) {
  byTool.set(log.tool, (byTool.get(log.tool) ?? 0) + log.cost);
}

console.log(`\nPipeline preview: ${logs.length} normalized logs`);
console.log(`Total spend: $${totalSpend.toFixed(2)}`);
for (const [tool, spend] of [...byTool.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${tool}: $${spend.toFixed(2)}`);
}
validatePareto(logs);

if (totalSpend < 15000 || totalSpend > 40000) {
  console.warn(
    `\n⚠ Spend $${totalSpend.toFixed(2)} is outside $15k–$40k target. Adjust SPEND_CALIBRATION (currently ${SPEND_CALIBRATION}).`,
  );
} else {
  console.log("\n✓ Spend within enterprise target range.");
}
