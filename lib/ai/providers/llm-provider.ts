// ─── Anthropic API ────────────────────────────────────────
// import { anthropicModel } from "./anthropic-provider";

// export const llmModel = anthropicModel;
// export const llmKey = process.env.ANTHROPIC_API_KEY;

// ─── Groq API ────────────────────────────────────────
import { groqModel } from "./groq-provider";

export const llmModel = groqModel;
export const llmKey = process.env.GROQ_API_KEY;
