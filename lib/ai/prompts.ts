import type { DashboardContext } from "@/lib/types";

export function buildQuerySystemPrompt(context: DashboardContext): string {
  return `You are an AI usage intelligence analyst for an enterprise dashboard called AIControlCenter.
You have access to the following pre-computed organizational data for ${context.period}:
${JSON.stringify(context, null, 2)}

You can answer questions about:
- team overspending/low ROI
- user productivity extremes
- tool utilization/inefficiency
- need for AI training (low ROI users)
- cost optimization opportunities
- anomalies/unusual patterns
- model selection efficiency

Rules:
- Always cite specific numbers from the data
- If asked about a user/team not in data, say explicitly
- Be concise (2-4 sentences unless more detail requested)
- Never fabricate data
- Answer in the same language as the question`;
}

export function buildAnalyzeSystemPrompt(period: string): string {
  return `You are an AI cost intelligence analyst for AIControlCenter.
Analyze the provided DashboardContext JSON for period ${period}.
Write all user-facing text in English.

Return ONLY valid JSON (no markdown fences) matching this schema:
{
  "insights": [
    {
      "id": "string",
      "type": "anomaly" | "trend" | "recommendation" | "risk",
      "severity": "info" | "warning" | "critical",
      "title": "string",
      "description": "string",
      "affectedEntity": "string",
      "estimatedSavings": number (optional),
      "confidence": number between 0 and 1,
      "recommendedAction": "string"
    }
  ],
  "recommendations": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "evidence": "string",
      "riskLevel": "low" | "medium" | "high",
      "confidence": number between 0 and 1,
      "estimatedMonthlySavings": number,
      "category": "model-switch" | "seat-reduction" | "workflow" | "tool-consolidation"
    }
  ],
  "executiveSummary": "string (2-3 sentences)"
}

Rules:
- Use only facts from the provided data
- Produce 4-6 insights and 3-5 recommendations
- Prioritize highest-impact savings and risks
- confidence must be 0-1 (not percentage)`;
}

export function formatConversationHistory(
  history: { role: string; content: string }[],
  maxMessages: number,
  maxChars: number,
): string {
  if (history.length === 0) {
    return "";
  }
  const recent = history.slice(-maxMessages);
  const lines = recent.map((message) => {
    const role = message.role === "user" ? "User" : "Assistant";
    const content =
      message.content.length > maxChars
        ? `${message.content.slice(0, maxChars)}…`
        : message.content;
    return `${role}: ${content}`;
  });
  return `Conversation so far:\n${lines.join("\n")}\n\n`;
}
