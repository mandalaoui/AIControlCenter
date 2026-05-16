import { anthropic } from "@ai-sdk/anthropic";
import { CLAUDE_MODEL } from "@/lib/ai/constants";

export const anthropicModel = anthropic(CLAUDE_MODEL);