import { createGroq } from "@ai-sdk/groq";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

export const groqModel = groq("meta-llama/llama-4-scout-17b-16e-instruct");