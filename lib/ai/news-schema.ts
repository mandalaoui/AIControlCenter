import { z } from "zod";

export const AiNewsItemSchema = z.object({
  id: z.string(),

  title: z.string(),

  summary: z.string(),

  source: z.string(),

  category: z.enum([
    "new-models",
    "pricing",
    "new-tools",
    "industry",
  ]),

  url: z.string(),

  publishedAt: z.string(),
});

export const AiNewsResponseSchema = z.object({
  items: z.array(AiNewsItemSchema),
  lastUpdated: z.string(),
  fromCache: z.boolean().default(false),
});